import { dyn, docClient } from "../db/initDb";
import { feedStore } from "../db/table.js";
import fs from "fs-extra";
import path from "path";
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
  existsSync(filePath) {
    try {
      fs.statSync(filePath);
    } catch (err) {
      if (err.code === "ENOENT") return false;
    }
    return true;
  }
  saveFetchInfo(sourceTitle, itemCount, totalSaved) {
    var params = {
      TableName: "SaveInfo",
      Key: {
        sourceName: sourceTitle
      },
      UpdateExpression: "set lastSavedTime =:dt, savedItem = :item ,totalSaved=:ts",
      ExpressionAttributeValues: {
        ":dt": parseInt(new Date().getTime()),
        ":item": parseInt(itemCount),
        ":ts": parseInt(totalSaved)
      },
      ReturnValues: "UPDATED_NEW"
    };
    return docClient.update(params, function(err, data) {
      if (err) {
        console.error(
          "Unable to update item. Error JSON:",
          JSON.stringify(err, null, 2)
        );
      }
    });
  }
  getSaveInfo(table) {
    try {
      return docClient
        .get({
          TableName: "SaveInfo",
          Key: {
            sourceName: table
          }
        })
        .promise()
        .then(data => {
          return data.Item;
        })
        .catch(e => console.log(e));
    } catch (e) {
      console.log(e);
    }
  }
  saveInfo(table, newSaved) {
    let d = new Date();
    let hours = d.getHours();
    let min = d.getMinutes();
    return this.getSaveInfo(table).then(data => {
      if (hours === 0 && min <= 10) data.totalSaved = 0;
      this.saveFetchInfo(table, newSaved, data.totalSaved + newSaved);
    });
  }
  putData(table, tableName, feedsArray) {
    let k = Object.keys(feedsArray);
    let l = k.length;
    let c = 1;
    let excludedItem = 0;
    let savedItem = {};
    let savedInfoPath = path.join(
      __dirname,
      "workstore",
      table,
      new Date().getDate().toString(),
      "saved.json"
    );
    if (this.existsSync(savedInfoPath)) {
      var savedInfo = fs.readJSONSync(savedInfoPath);
      var savedInfoKeys = Object.keys(savedInfo);
    }
    try {
      return new Promise((resolve, reject) => {
        if (l > 0) {
          k.map((key, i) => {
            if (savedInfoKeys && savedInfoKeys.includes(key)) {
              if (c === l) {
                return resolve(true);
              }
              // console.log("item %s already saved for %s", key, tableName);
              excludedItem++;
              c++;
              return;
            }
            let item = feedsArray[key];
            docClient
              .put({
                TableName: tableName,
                Item: omitEmpty(item)
              })
              .promise()
              .then(r => {
                savedItem[key] = true;
                if (c === l) {
                  // if everything finishes
                  console.log(
                    "%s => total =>(%s) excluded =>(%s)",
                    tableName,
                    l,
                    excludedItem
                  );
                  let newSaved = l - excludedItem;
                  let totalItem = savedInfo
                    ? Object.assign({}, savedItem, savedInfo)
                    : savedItem;
                  fs.writeJsonSync(savedInfoPath, totalItem);
                  if (process.env.NODE_ENV === "production")
                    this.saveInfo(table, newSaved);
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

        let putNow = () => {
          return self
            .putData(table, tableName, feeds)
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
