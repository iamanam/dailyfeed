import { dyn, docClient } from "../db/initDb";
import { feedStore } from "../db/table.js";
import fs from "fs-extra";

var omitEmpty = require("omit-empty");
var Promise = require("bluebird");

export default class SaveFeedDyno {
  formatFeeds(tableName, feeds) {
    let dataStore = [];
    let feedKeys = Object.keys(feeds);
    // in case of too many data we need to put data periodically as dynomodb has a limit;
    // in case of many feeds it won't write data out of its capacity
    // so we writing a function which will put a spefic item at a time, rather than trying to put all together;
    let feedLength = feedKeys.length;
    let divider = 15;
    let lengthTracker = feedKeys.length;

    function formatData(feedKeys) {
      let store = [];
      feedKeys.map((item, i) => {
        let singleFeed = feeds[item]; // its an object
        omitEmpty(singleFeed); // it will remove empty proerties
        store.push({
          PutRequest: {
            Item: singleFeed
          }
        });
      });
      return dataStore.push(store);
    }
    function littleDataMaker(c) {
      if (lengthTracker <= 0) return;
      if (lengthTracker >= divider) {
        let splitedFeed = feedKeys.slice(c, c + divider);
        formatData(splitedFeed);
        lengthTracker -= divider;
        if (lengthTracker > divider) {
          return littleDataMaker(c + divider);
        } else {
          let splitedFeed = feedKeys.slice(
            feedLength - lengthTracker,
            feedLength
          );
          formatData(splitedFeed);
          return dataStore;
        }
      }
    }
    if (feedLength > divider) return littleDataMaker(0);
    else {
      formatData(Object.keys(feeds));
      return dataStore;
    }
  }
  putData(tableName, feedsArray) {
    let k = Object.keys(feedsArray);
    let l = k.length;
    let c = 1;
    try {
      return new Promise((resolve, reject) => {
        if (l > 0) {
          k.map((key, i) => {
            let item = feedsArray[key];
            docClient
              .put({
                TableName: tableName,
                Item: item
              })
              .promise()
              .then(r => {
                if (c === l) {
                  console.log("saving %s item for %s", l, tableName);
                  return resolve(true);
                }
                c++;
              })
              .catch(e => console.log(e));
          });
        }
      });
    } catch (e) {
      console.log(e);
    }
  }
  init(table, feeds) {
    let self = this;
    try {
      return new Promise((resolve, reject) => {
        let date = new Date().getDate();
        let tableName = table + "_" + date;
        // let yesTableName = table + "_" + date - 1;
        // let formattedFeeds = self.formatFeeds(tableName, feeds);
        let putNow = () => {
          return self
            .putData(tableName, feeds)
            .then(r => {
              resolve(true);
            })
            .catch(e => console.log(e));
        };
        dyn.listTables((e, ls) => {
          if (ls["TableNames"].includes(tableName)) {
            return putNow();
          }
          return dyn.createTable(feedStore(tableName), (e, r) => {
            if (e) {
              console.log(e);
              reject(e);
            }
            if (r["TableDescription"]["TableStatus"] === "ACTIVE") {
              return putNow();
            }
          });
        });
      });
    } catch (e) {
      console.log(e);
      return Promise.resolve(true);
    }
  }
}

/*
module.exports = {
  runWorker: function() {
    try {
      console.log("saving on dyno started");
      var path = require("path");
      fs.readdir(path.join(__dirname, "workstore"), (e, d) => {
        d.forEach(async folder => {
          let infoPath = path.join(__dirname, "workstore", folder, "info.json");
          let info = require(infoPath);
          if (!info.raid) {
            let fileName = info.lastSavedFile;
            info.raid = true;
            let getFile = require(fileName);
            var t = new SaveFeedDyno();
            await t.init(folder, getFile);
            console.log("Done one %s", folder);
            return fs.writeJSON(infoPath, info);
          }
          return console.log("cancelled raid for %s", folder);
        });
      });
    } catch (e) {
      console.log(e);
    }
  }
};

// var feeds = require("./workstore/ittefaq/30_4_9.json");
// var t = new SaveFeedDyno();
// t.init("jugantor", feeds);

/*
          let saveOnDyno = new SaveFeedDyno();
          return saveOnDyno
            .init(this.feedSource, this.allFeeds)
            .then(d => {
              if (d) {
                console.log("Work finished for %s", this.feedSource);
                return resolve(d);
              }
            })
            .catch(e => {
              console.log(e);
              resolve(true);
            });


              makeTable(tableName, yesTableName) {
    return new Promise(async (resolve, reject) => {
      try {
        var table = await dyn.listTables().promise();
        if (table["TableNames"].includes(yesTableName)) {
          deletTable(dyn, yesTableName);
        }
        if (!table["TableNames"].includes(tableName)) {
          var d = await createTable(dyn, feedStore(tableName));
          console.log(d);
          resolve(d);
        }
      } catch (e) {
        reject(e);
      }
    });
  }
            */

/*
          feedsArray.map(async (feedSplited, i) => {
            let Data = {};
            console.log("feed spillted");
            console.log(feedSplited);
            Data[tableName] = feedSplited;
            await docClient.batchWrite(
              {
                RequestItems: Data
              },
              (e, r) => {
                if (e) return reject(e);
                if (i === 0) {
                  return resolve(true);
                }
              }
            );
          });
          */
