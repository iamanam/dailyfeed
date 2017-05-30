import formatItem from "./formatter";
import { sortBy } from "underscore";
import { deletTable } from "../db/helper";
import { dyn } from "../db/initDb";
import SaveDyno from "./saveDyno";
const path = require("path");
const axios = require("axios");
const fs = require("fs-extra");
const EventEmitter = require("events");
const FeedParser = require("feedparser");
// const Promise = require("bluebird");
const through2 = require("through2");
const myEmitter = new EventEmitter();

class Worker {
  constructor(feedSource, feedUrl) {
    this.feedSource = feedSource;
    this.feedUrl = feedUrl;
    this.destFolder = path.join(__dirname, "workstore", feedSource);
    this.formatItem = formatItem.bind(this);
    this.date = new Date();
    this.allFeeds = {};
  }
  getFetchInfo() {
    try {
      let fetchInfo = require(this.destFolder + "/info.json");
      if (typeof fetchInfo === "object" && Object.keys(fetchInfo).length > 0) {
        return fetchInfo;
      }
    } catch (e) {
      return false;
    }
  }
  getFileName() {
    var d = this.date;
    return (
      this.destFolder +
      "/" +
      d.getDate() +
      "_" +
      d.getHours() +
      "_" +
      d.getMinutes() +
      ".json"
    );
  }
  fetchXml() {
    try {
      return axios.get(this.feedUrl, {
        responseType: "stream",
        timeout: 5000
      });
    } catch (e) {
      myEmitter.emit("error", "couldn't fetch data for " + this.feedUrl);
    }
  }

  isAnyNewFeed(latestTitle) {
    let fetchInfo = this.getFetchInfo();
    // console.log(fetchInfo["firstItem"], latestTitle);
    if (fetchInfo) return fetchInfo["firstItem"] === latestTitle;
    return false;
  }
  saveParsed() {
    try {
      if (Object.keys(this.allFeeds).length < 1)
        return myEmitter.emit("info", "cancelled");
      // ensure folder before saving operation
      fs.ensureDir(this.destFolder, err => {
        if (err) myEmitter.emit("error", err);
        // dir has now been created, including the directory it is to be placed in
        var w = fs.createWriteStream(this.getFileName());
        w.write(JSON.stringify(this.allFeeds));
        w.on("finish", () => myEmitter.emit("info", 1));
        w.end();
      });
    } catch (e) {
      myEmitter.emit("error", e);
    }
  }
  saveFetchInfo() {
    var data = this.allFeeds;
    try {
      var sorted = sortBy(data, function(item) {
        return -new Date(item.publish).getTime();
      });
      if (sorted.length < 1) return myEmitter.emit("info", "cancelled");
      let infoFile = this.destFolder + "/info.json";
      fs.ensureFile(infoFile, (e, r) => {
        if (e) return console.log(e);
        var w = fs.createWriteStream(infoFile);
        w.write(
          JSON.stringify({
            lastSavedFile: this.getFileName(),
            lastFetched: this.date,
            firstItem: sorted[0].title
          })
        );
        w.on("finish", () => myEmitter.emit("info", 2));
        return w.end();
      });
    } catch (e) {
      myEmitter.emit("error", e);
    }
  }
  // this will pipe response stream to feedparser
  pipeToFeedParser(fetch) {
    let feedparser = new FeedParser();
    let self = this;
    let run = 0;
    let zeroAlreadyrun = false;
    fetch
      .then(response => {
        if (response.status !== 200) {
          return myEmitter.emit("error", "Couldn't fetch xml");
        }
        response.data // if response is good
          .pipe(feedparser) // pipe to feedparser
          .pipe(
            // pipe to through2
            through2.obj(async function(chunk, enc, cb) {
              try {
                let title = chunk.title;
                if (run === 0 && !zeroAlreadyrun) {
                  if (!self.firstItemTitle) self.firstItemTitle = title; // save the first item for later use;
                  // Check if there are any new news item by comparing with last saved file and continue if its true
                  if (self.isAnyNewFeed(title)) {
                    return myEmitter.emit("info", "cancelled");
                  }
                  zeroAlreadyrun = true;
                }
                var fi = await self.formatItem(chunk); // format chunk
                // collect the latest item only, when old item which already saved found then return the latest items
                if (
                  self.getFetchInfo() &&
                  self.getFetchInfo()["firstItem"] === title
                ) {
                  return self.saveParsed();
                }
                // if there are new item to be processed and saved
                this.push(fi);
                cb();
                run++;
              } catch (e) {
                myEmitter.emit(
                  "error",
                  "Problem in piping through feedparser \n" + e
                );
              }
            })
          )
          .on("data", data => {
            if (data.title !== "দেশে ফিরেছেন প্রধানমন্ত্রী")
              self.allFeeds[data.title] = data;
          }) // push each item to all
          .on("finish", () => self.saveParsed()); // save json
      })
      .catch(e => myEmitter.emit("error", e));
  }
  init() {
    return new Promise((resolve, reject) => {
      this.pipeToFeedParser(this.fetchXml());
      let info = {
        source: this.feedSource,
        data: this.allFeeds
      };
      myEmitter.on("info", (step, data) => {
        if (step === "cancelled") {
          return resolve(info);
        }
        if (step === 1) {
          this.saveFetchInfo(); // after first step done, start saving info
        }
        if (step === 2) {
          resolve(info);
        }
      });
      myEmitter.on("error", message => console.log(message));
    });
  }
}
/*
var work = new Worker("prothom-alo", "http://www.prothom-alo.com/feed/");
let isFinish = work.init();
console.log(isFinish);
*/
const source = process.env.NODE_ENV === "production"
  ? require("../../config/source_pro.json")
  : require("../../config/source.json");

/*
function t(item) {
  return new Promise(resolve => {
    setTimeout(() => resolve(item), 2000);
  });
}

Object.keys(source).forEach(async item => {
  console.time("test");
  let url = source[item].sourceUrl;
  let res = await t(item);
  console.log(res);
  console.timeEnd("test");
});

*/
let totalItem = Object.keys(source).length - 1;

async function runWorkerForAll() {
  try {
    let title = Object.keys(source)[totalItem];
    let url = source[title].sourceUrl;
    var work = new Worker(title, url);
    let data = await work.init();
    if (data.data && data.source && Object.keys(data.data).length > 0) {
      let dynoSaving = new SaveDyno();
      await dynoSaving.init(data.source, data.data);
    } else console.log("Nothing to save on dyno for %s", data.source);

    if (data && totalItem !== 0) {
      totalItem--;
      return runWorkerForAll();
    }
  } catch (e) {
    console.log(e);
  }
}

runWorkerForAll();

/*
setInterval(() => {
  let dynoProcess = require("./saveDyno");
  dynoProcess.runWorker();
}, 1000 * 60 * 5);


setInterval(() => {
  let day = new Date().getDate() - 1;
  try {
    Object.keys(source).map(async item => {
      let tableName = item + "_" + day;
      var table = await dyn.listTables().promise();
      if (table["TableNames"].includes(tableName)) {
        await deletTable(dyn, tableName);
      }
    });
  } catch (e) {
    console.log(e);
  }
}, 1000 * 60 * 60 * 12);
*/
