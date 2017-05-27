import { dyn, docClient } from "../db/initDb";
import createTable, { feedStore } from "../db/table.js";
const source = process.env.NODE_ENV === "development"
  ? require("../../config/source.json")
  : require("../../config/source_pro.json");
var omitEmpty = require("omit-empty");

export default class SaveFeedDyno {
  /*
  async manageTable(tableName) {
    try {
      var table = await dyn.listTables().promise();
      if (table["TableNames"].includes(tableName))
        return console.log("%s table exist", tableName);
      let result = await createTable(dyn, feedStore(tableName));
      return Promise.resolve(result);
    } catch (e) {
      console.log(e);
    }
  }
  fformatFeeds (tableName, feeds) {
    let store = []
    let feedKeys = Object.keys(feeds)
    feedKeys.map((item, i) => {
      let singleFeed = feeds[item] // its an object
      singleFeed.publish = Date.now()
      store.push({
        PutRequest: {
          Item: singleFeed
        }
      })
    })
    return store
  } */
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
        singleFeed.publish = new Date(singleFeed.pubDate).getTime();
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
    return littleDataMaker(0);
  }
  putData(tableName, feedsArray) {
    feedsArray.map(feedSplited => {
      let Data = {};
      Data[tableName] = feedSplited;
      docClient.batchWrite(
        {
          RequestItems: Data
        },
        (e, r) => {
          if (e) return console.log(e);
          console.log("Data for %s saved successfully in dynomodb", tableName);
        }
      );
    });
  }
  init(table, feeds) {
    let self = this;
    /*
    // first of all lets make dynomodb tables if they don't exist
    let allPromise = [] // prmise holder
    Object.keys(source).map(async element => {
      // go through each feed source
      var table = await dyn.listTables().promise()
      if (table['TableNames'].includes(element)) {
        return console.log('%s table exist', element)
      }
      allPromise.push(createTable(dyn, feedStore(element)))
    })
    Promise.all(allPromise)
      .then(async () => {

        console.log(table);
        setTimeout(() => {

          return console.log("table %s doesn't exis yet", tableName)
        }, 8000)
      })
      */
    try {
      let date = new Date().getDate();
      let tableName = table + "_" + date;
      let formattedFeeds = self.formatFeeds(tableName, feeds);
      return self.putData(tableName, formattedFeeds);
    } catch (e) {
      console.log(e);
    }
  }
}
