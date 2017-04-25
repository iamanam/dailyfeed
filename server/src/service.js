import serveFeed from "./serveFeed";
import source from "../../config/source.json";
import findRemoveSync from "find-remove";
import fs from "fs-extra";
import path from "path";
const rootPath = process.env.rootPath || path.join(__dirname, "..", "..");
var Promise = require("bluebird");
const AutoService = class {
  constructor(updateInterval) {
    this.updateInterval = updateInterval; // this is config setting for update interval
    this.updatedMerge = {}; // this will hold the lates updateed merge
    this.minCounter = 0; // this will use to track passed min between instance
    this.nextUpdate = ""; // this will return the remaining time
    this.latestUpdates = {};
    this.serviceRunnng = 0;
    this.firstFeed = {};
  }
  getPath(...arg) {
    return path.join(rootPath, "store", ...arg);
  }
  writeIndex(sourceTitle, dataToWrite) {
    // add the lastest merged source for use later
    // now write the file in index.json
    return fs.writeJson(
      this.getPath(sourceTitle, "index.json"),
      { items: dataToWrite },
      err => {
        if (err) return console.error(err);
        console.log("merging success!");
      }
    );
  }
  mergeEach(sourceTitle, latestFeedFetched) {
    // find store folder for each source feed
    fs.readdir(this.getPath(sourceTitle), (err, res) => {
      // if err or file in dir is less than one then write latest latestFeedFetched as index.json
      if (err || res.length === 0) {
        return this.writeIndex(sourceTitle, latestFeedFetched);
      }
      // if there are more files then merge and write it in index.json
      try {
        if (typeof res === "object" && res.length >= 1) {
          let fileMergeTotal = {};
          res.reverse().map(file => {
            if (file === "index.json") return; // need to ignore index file as its our destination writie
            let getFile = this.getPath(sourceTitle, file);
            if (getFile || getFile !== "" || typeof getFile !== "undefined") {
              fileMergeTotal[sourceTitle] = Object.assign(
                {},
                latestFeedFetched,
                fs.readJsonSync(getFile)
              );
            }
          });
          return this.writeIndex(sourceTitle, fileMergeTotal[sourceTitle]);
        }
      } catch (e) {
        // if any occur at file system or in merging then at least write latestFeed in index.json
        console.error("Error on Merging \n", e);
        return this.writeIndex(sourceTitle, latestFeedFetched);
      }
    });
  }
  /**
 * This function fetch update by calling the serveFeed method
 * It calls out all the source titles included and call the mergeEachSourceFile to merge lates feeds
 * It also return the feeds for all source <object data="" type=""></object>
 * @param {object} lastUpdate - The last successful update to compare it with latest update
 * @returns Promise
 */
  async fetchUpdateAuto() {
    var self = this;
    let updateStore = {};
    try {
      return await Object.keys(source).reduce(function(promise, sourceTitle) {
        return promise.then(function() {
          return serveFeed(sourceTitle, self.latestUpdates || {})
            .catch(e => console.log(e))
            .then(function(res) {
              self.firstFeed[sourceTitle] = res["feeds"];
              // new update availble then add it on object
              if (res.isUpdateAvailable) {
                self.mergeEach(sourceTitle, res["feeds"]);
                // save update object of each feed source so that it could be returned after loop
                updateStore[sourceTitle] = res;
                updateStore[sourceTitle]["lastFetch"] = Date.now();
              } else console.log("No new update available for %s", sourceTitle);
              // now merge all timely json file which was saved at regular instance
              return updateStore;
            })
            .catch(e => console.log(e));
        });
      }, Promise.resolve());
    } catch (e) {
      console.log(e);
    }
  }
  // after fetching files delete json files which is older than 12 hrs
  // setInterval(deleteOldSource, 60000 * 60 * 8); //
  deleteOldSource() {
    let result = findRemoveSync(path.join(rootPath, "store"), {
      age: { seconds: 3600 * 12 }, // 12 hr
      maxLevel: 2,
      extensions: ".json"
    });
    console.log("Old json source file which were deleted :", result);
  }

  runService(param) {
    let self = this;
    self.serviceRunnng = 0;
    Promise.resolve(this.fetchUpdateAuto())
      .catch(e => console.log(e))
      .then(getAllUpdate => {
        if (typeof getAllUpdate !== "undefined" && getAllUpdate !== {}) {
          self.latestUpdates = Object.assign(
            {},
            getAllUpdate,
            self.latestUpdates
          );
          self.nextUpdate = Date.now() + 60000 * self.updateInterval;
        } else console.log("something wrong in runService");
      });
    self.serviceRunnng = 0;
  }
};

export default AutoService;
