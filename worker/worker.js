import formatItem from "./formatter";
import { sortBy } from "underscore";
import SaveFeedDyno from "./saveDyno";
const path = require("path");
const axios = require("axios");
const fs = require("fs-extra");
const EventEmitter = require("events");
const FeedParser = require("feedparser");
// const Promise = require("bluebird");
const through2 = require("through2");
const myEmitter = new EventEmitter();
let successFullRun = 0;

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
      var w = fs.createWriteStream(this.destFolder + "/info.json");
      w.write(
        JSON.stringify({
          lastSavedFile: this.getFileName(),
          lastFetched: this.date,
          firstItem: sorted[0].title
        })
      );
      w.on("finish", () => myEmitter.emit("info", 2));
      return w.end();
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
                  return self.saveParsed(self.allFeeds);
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
      myEmitter.on("info", (step, data) => {
        if (step === "cancelled") return resolve(true);
        if (step === 1) this.saveFetchInfo(data); // after first step done, start saving info
        if (step === 2) {
          let saveOnDyno = new SaveFeedDyno();
          return saveOnDyno
            .init(this.feedSource, this.allFeeds)
            .then(d => {
              if (d) {
                console.log("Work finished for %s", this.feedSource);
                resolve(d);
              }
            })
            .catch(e => console.log(e));
        }
      });
      myEmitter.on("error", message => console.log(message));
    });
  }
}

let source = require("../config/source.json");
let totalItem = Object.keys(source).length - 1;

async function runWorkerForAll() {
  let title = Object.keys(source)[totalItem];
  let url = source[title].sourceUrl;
  var work = new Worker(title, url);
  let isFinish = await work.init();
  if (isFinish && totalItem !== 0) {
    totalItem--;
    successFullRun++;
    return runWorkerForAll();
  }
}

// runWorkerForAll();

setInterval(() => runWorkerForAll(), 1000 * 60 * 15);

/* let saveOnDyno = new SaveFeedDyno();
          saveOnDyno
            .init(this.feedSource, this.getFileName())
            .then(d => {
              if (d) {
                console.log(d);
              }
            })
            .catch(e => console.log(e)); */
