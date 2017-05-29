import { dyn, docClient } from "../server/db/initDb";
import createTable, { feedStore } from "../server/db/table.js";
import { deletTable } from "../server/db/helper";
var omitEmpty = require("omit-empty");
var Promise = require("bluebird");

export default class SaveFeedDyno {
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
    return new Promise((resolve, reject) => {
      if (feedsArray && feedsArray.length > 0) {
        feedsArray.map(async (feedSplited, i) => {
          let Data = {};
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
      }
    });
  }
  init(table, feeds) {
    let self = this;
    try {
      return new Promise((resolve, reject) => {
        let date = new Date().getDate();
        let tableName = table + "_" + date;
        // let yesTableName = table + "_" + date - 1;
        let formattedFeeds = self.formatFeeds(tableName, feeds);
        let putNow = () => {
          return self
            .putData(tableName, formattedFeeds)
            .then(r => {
              resolve(r);
            })
            .catch(e => console.log(e));
        };
        dyn.listTables((e, ls) => {
          if (ls["TableNames"].includes(tableName)) {
            putNow();
          }
          return dyn.createTable(feedStore(tableName), (e, r) => {
            if (e) return resolve(true);
            if (r["TableDescription"]["TableStatus"] === "ACTIVE") {
              putNow();
            }
          });
        });
      });
    } catch (e) {
      console.log(e);
    }
  }
}
