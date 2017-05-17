import serveFeed from "./serveFeed";
import findRemoveSync from "find-remove";
import { updateItem } from "../db/helper.js";
import timeAgo from "timeago.js";
import uploadFile from "./s3_upload";
import fs from "fs-extra";
import path from "path";
const config = process.env.NODE_ENV === "development"
  ? require("../../config/config.json")
  : require("../../config/config_production.json");
const source = process.env.NODE_ENV === "development"
  ? require("../../config/source.json")
  : require("../../config/source_pro.json");

const rootPath = process.env.rootPath || path.join(__dirname, "..", "..");
var Promise = require("bluebird");
let timeago = timeAgo();
const AutoService = class {
  constructor(updateInterval) {
    this.updateInterval = updateInterval; // this is config setting for update interval
    this.updatedMerge = {}; // this will hold the lates updateed merge
    this.minCounter = 0; // this will use to track passed min between instance
    this.nextUpdate = ""; // this will return the remaining time
    this.serviceRunnng = "false";
    this.nextClean = "";
  }
  getPath(...arg) {
    return path.join(rootPath, "store", ...arg);
  }
  saveFetchInfo(sourceTitle, feedLength, fileName) {
    var params = {
      TableName: "FeedSourceInfo",
      Key: {
        sourceTitle: sourceTitle
      },
      UpdateExpression: "set lastFetched =:dt, feedItem = :item , fileName=:fileName",
      ExpressionAttributeValues: {
        ":dt": Date.now(),
        ":item": feedLength,
        ":fileName": fileName
      },
      ReturnValues: "UPDATED_NEW"
    };
    return updateItem(params);
  }

  writeData(sourceTitle, dataToWrite) {
    // after merging happen feed length will change, so update the length
    dataToWrite.feedsLength = Object.keys(dataToWrite["feeds"]).length;
    try {
      // now save the fetching info in db
      this.saveFetchInfo(
        sourceTitle,
        dataToWrite.feedsLength,
        dataToWrite.fileName // its trick to find the latest file saved after index.json
      );
    } catch (e) {
      console.log(e);
    } finally {
      // add the lastest merged source for use later
      // now write the file in index.json
      fs.writeJson(
        this.getPath(sourceTitle, "index.json"),
        dataToWrite,
        err => {
          if (err)
            return console.error(
              "Index.json couldn't be saved. Reason :=> \n" + err
            );
          console.log("Index.json for %s saved!", sourceTitle);
        }
      );
    }
  }
  mergeEach(sourceTitle, latestFeedFetched) {
    let self = this;
    return new Promise(resolve => {
      // find store folder for each source feed
      fs.readdir(this.getPath(sourceTitle), (err, res) => {
        // if err or file in dir is less than one then write latest latestFeedFetched as index.json
        if (err || res.length === 0) {
          return this.writeData(sourceTitle, latestFeedFetched);
        }
        // if there are more files then merge and write it in index.json
        try {
          if (typeof res === "object" && res.length >= 1) {
            // let fileMergeTotal = {};
            res.reverse().map(file => {
              if (file === "index.json") return; // need to ignore index file as its our destination writie
              let getFile = this.getPath(sourceTitle, file);
              if (getFile || getFile !== "" || typeof getFile !== "undefined") {
                // merge only feeds, so we keeping intact other properties of lastfetched while merging feeds only
                latestFeedFetched["feeds"] = Object.assign(
                  {},
                  latestFeedFetched["feeds"],
                  fs.readJsonSync(getFile)
                );
              }
            });
            // save updated latestfetched after merged saved as backup
            self.updatedMerge[sourceTitle] = latestFeedFetched;
            resolve(latestFeedFetched);
          }
        } catch (e) {
          // if any occur at file system or in merging then at least write latestFeed in index.json
          console.error("Error on Merging \n", e);
        }
      });
    });
  }
  isUpdateRequired(key) {
    if (process.env.NODE_ENV === "production") return true;
    return new Promise((resolve, reject) => {
      fs.stat(this.getPath(key, "index.json"), (e, c) => {
        if (e) return resolve(true);
        // minus 1 for the time spent on parsing other file
        let updateInterval = config.updating.autoUpdateTime - 1 * 60000;
        if (Date.parse(c.mtime) + updateInterval >= Date.now()) {
          console.log(
            "%s updated=> at %s Next update=> %s",
            key,
            timeago.format(c.mtime),
            timeago.format(Date.parse(c.mtime) + updateInterval)
          );
          return resolve(false);
        }
        resolve(true);
      });
    });
  }
  /**
 * This function fetch update by calling the serveFeed method
 * It calls out all the source titles included and call the mergeEachSourceFile to merge lates feeds
 * It also return the feeds for all source <object data="" type=""></object>
 * @param {object} lastUpdate - The last successful update to compare it with latest update
 * @returns Promise
 */
  async fetchUpdateForAll() {
    let self = this;
    async function promiseBind(key) {
      try {
        var feed = {};
        feed[key] = await serveFeed(key, self.updatedMerge || {});
        return Promise.resolve(feed);
      } catch (e) {
        console.log(e);
      }
    }
    let allPromises = [];
    for (var key in source) {
      // first check if update require before fetching then push if available
      if (await self.isUpdateRequired(key)) allPromises.push(promiseBind(key));
    }
    // return false if there are nothing to fetch
    return allPromises.length >= 1 ? Promise.all(allPromises) : false;
  }

  // after fetching files delete json files which is older than 12 hrs
  deleteOldSource() {
    let result = findRemoveSync(path.join(rootPath, "store"), {
      age: { seconds: 3600 * 12 }, // 12 hr
      maxLevel: 2,
      extensions: ".json",
      ignore: "index.json"
    });

    console.log("Old json source file which were deleted :", result);
  }

  /**
   * The main function to run the service
   * @param {any} param 
   */
  async runService(param) {
    let self = this;
    try {
      self.serviceRunnng = "true";
      // at first delete outdated json files before merging occur
      // self.deleteOldSource();
      // now fetch latest updates
      let fetchUpdateAll = await this.fetchUpdateForAll();
      // after update finish then merge latest feeds with old feeds for each different source
      if (fetchUpdateAll && typeof fetchUpdateAll === "object") {
        fetchUpdateAll.map(async function(feedUpdate) {
          let keyName = Object.keys(feedUpdate)[0];
          if (feedUpdate[keyName].isUpdateAvailable) {
            // start merging
            let mergedFeeds = await self.mergeEach(
              keyName, // source title
              feedUpdate[keyName] // source values as feeds
            );
            // after successful merging write in db and updated feeds in index.json
            let dataJson = typeof mergedFeeds === "object"
              ? mergedFeeds
              : feedUpdate[keyName];
            // start uploading to s3 server only if its production server
            if (process.env.NODE_ENV === "production") {
              uploadFile(
                keyName + ".json",
                JSON.stringify(dataJson),
                "application/json"
              );
            }
            return self.writeData(keyName, dataJson);
          }
          console.log("service cancelled");
        });
      }
    } catch (e) {
      console.log(e);
    } finally {
      self.serviceRunnng = "false";
      self.nextUpdate = Date.now() + 60000 * config.updating.autoUpdateTime;
    }
  }
};
module.exports = AutoService;
