import formatItem from "./formatter";
import { sortBy } from "underscore";
// import { deletTable } from "../db/helper";

import SaveDyno from "./saveDyno";
const path = require("path");
const axios = require("axios");
const fs = require("fs-extra");
const EventEmitter = require("events");
const FeedParser = require("feedparser");
const Promise = require("bluebird");
const through2 = require("through2");

var updateTime = 5;
var totalUpdate = 0;
class Worker {
  constructor(feedSource, feedUrl, myEmitter) {
    this.feedSource = feedSource;
    this.feedUrl = feedUrl;
    this.destFolder = path.join(
      __dirname,
      "workstore",
      feedSource,
      new Date().getDate().toString()
    );
    this.formatItem = formatItem.bind(this);
    this.date = new Date();
    this.myEmitter = myEmitter;
    this.allFeeds = {};
    this.infoFile = this.destFolder + "/info.json";
    this.run = 0;
  }
  getFetchInfo() {
    try {
      let fetchInfo = fs.readJSONSync(this.infoFile);
      if (typeof fetchInfo === "object" && Object.keys(fetchInfo).length > 0) {
        return fetchInfo;
      }
    } catch (e) {
      let oldDate = new Date(new Date().getTime() - 1000 * 60 * 60 * 24)
        .getDate()
        .toString();
      let oldInfopath = path.join(
        __dirname,
        "workstore",
        this.feedSource,
        oldDate
      );
      let infoFile = oldInfopath + "/info.json";
      if (this.existsSync(infoFile)) {
        let fetchInfo = fs.readJSONSync(infoFile);
        if (
          typeof fetchInfo === "object" &&
          Object.keys(fetchInfo).length > 0
        ) {
          console.log("using old info file");
          return fetchInfo;
        }
      }
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
        timeout: 10000
      });
    } catch (e) {
      this.myEmitter.emit("error", "couldn't fetch data for " + this.feedUrl);
    }
  }

  isAnyNewFeed(latestTitle) {
    try {
      let fetchInfo = this.getFetchInfo();
      // console.log(fetchInfo["firstItem"], latestTitle);
      if (fetchInfo) {
        // if items are not updating for 4 hrs then return false, to fetch all
        if (
          new Date(fetchInfo.lastFetched).getTime() <
          new Date().getTime() - 1000 * 60 * 60 * 3
        ) {
          console.log("updating all as its not been updating for a while");
          return false;
        }
        return fetchInfo["firstItem"] === latestTitle;
      }
      return false;
    } catch (e) {
      return false;
    }
  }
  saveParsed() {
    try {
      if (Object.keys(this.allFeeds).length < 1)
        return this.myEmitter.emit("info", "cancelled");
      // ensure folder before saving operation
      fs.ensureDir(this.destFolder, err => {
        if (err) this.myEmitter.emit("error", err);
        // dir has now been created, including the directory it is to be placed in
        var w = fs.createWriteStream(this.getFileName());
        w.write(JSON.stringify(this.allFeeds));
        w.on("finish", () => this.myEmitter.emit("info", 1));
        w.end();
      });
    } catch (e) {
      this.myEmitter.emit("error", e);
    }
  }
  existsSync(filePath) {
    try {
      fs.statSync(filePath);
    } catch (err) {
      if (err.code === "ENOENT") return false;
    }
    return true;
  }
  saveFetchInfo() {
    var data = this.allFeeds;
    let infoFile = this.destFolder + "/info.json";

    try {
      var sorted = sortBy(data, function(item) {
        return -new Date(item.publish).getTime();
      });
      var sortedFirst;
      if (sorted && sorted[0] && sorted[0].title) {
        sortedFirst = sorted[0].title;
      } else sortedFirst = this.firstItemTitle;
      let firstItem = this.feedSource === "jugantor" ||
        this.feedSource === "ittefaq"
        ? sortedFirst
        : this.firstItemTitle ? this.firstItemTitle : sortedFirst;

      if (sorted.length < 1) return this.myEmitter.emit("info", "cancelled");
      fs.ensureFile(infoFile, (e, r) => {
        if (e) return console.log(e);
        let data = {
          lastSavedFile: this.getFileName(),
          lastFetched: this.date,
          firstItem: firstItem
        };

        var w = fs.createWriteStream(infoFile);
        w.write(JSON.stringify(data));
        w.on("finish", () => this.myEmitter.emit("info", 2));
        return w.end();
      });
    } catch (e) {
      this.myEmitter.emit("error", e);
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
          return self.myEmitter.emit("error", "Couldn't fetch xml");
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
                    return self.myEmitter.emit("info", "cancelled");
                  }
                  zeroAlreadyrun = true;
                }
                var fi = await self.formatItem(chunk, self.feedSource); // format chunk
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
                self.myEmitter.emit(
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
      .catch(e => self.myEmitter.emit("error", e));
  }

  init() {
    return new Promise((resolve, reject) => {
      this.pipeToFeedParser(this.fetchXml());
      let info = {
        source: this.feedSource,
        data: this.allFeeds
      };
      this.myEmitter.on("info", (step, data) => {
        if (step === "cancelled") {
          return resolve(info);
        }
        if (step === 1) {
          this.saveFetchInfo(); // after first step done, start saving info
        }
        if (step === 2) {
          // this.filterAlreadySaved();
          resolve(info);
        }
      });
      this.myEmitter.on("error", message => console.log(message));
    });
  }
}

const source = process.env.NODE_ENV === "production"
  ? require("../../config/source_pro.json")
  : require("../../config/source.json");

// let totalItem = Object.keys(source).length - 1;

async function runWorkerForAll(totalItem) {
  try {
    let title = Object.keys(source)[totalItem];
    console.log("work start for %s =item no=> %s", title, totalItem);
    let url = source[title].sourceUrl;
    const myEmitter = new EventEmitter();
    myEmitter.setMaxListeners(20);
    var work = new Worker(title, url, myEmitter);
    let data = await work.init();
    if (data.data && data.source && Object.keys(data.data).length > 0) {
      let dynoSaving = new SaveDyno();
      await dynoSaving.init(data.source, data.data);
    }
    if (data && totalItem !== 0) {
      totalItem--;
      return runWorkerForAll(totalItem);
    }
  } catch (e) {
    console.log(e);
  }
}

let totalItem = Object.keys(source).length - 1;
runWorkerForAll(totalItem);

setInterval(() => {
  console.log(
    "======== Update no-> %s ====== Next Update %s ",
    totalUpdate,
    new Date(new Date().getTime() + 1000 * 60 * updateTime)
  );
  console.log(
    "\n -----------------------------------------------------------------------"
  );
  let totalItem = Object.keys(source).length - 1;
  runWorkerForAll(totalItem);
  totalUpdate++;
}, 1000 * 60 * updateTime);
