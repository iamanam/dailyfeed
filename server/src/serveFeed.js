import CollectFeed from "./collectFeed";
import source from "../../config/source.json";
import { updateItem } from "../db/helper.js";
let feedSource = JSON.parse(JSON.stringify(source));

const saveFetchInfo = (sourceTitle, feedLength, fileName) => {
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
};

/**
 * It will fetch the feeds and parse it & save it as json
 * Souce can be user specific souce or all souce which saved by defualt
 * @param {object} source
 */
const serveFeed = (sourceTitle, lastUpdate) => {
  if (lastUpdate[sourceTitle]) {
    var lastFeeds = lastUpdate[sourceTitle]["feeds"];
    var lastFirstFeedTitle = Object.keys(lastFeeds)[0];
  }
  let getFeedSource = feedSource[sourceTitle];
  var feedManage = new CollectFeed(
    sourceTitle,
    getFeedSource.sourceUrl,
    lastFirstFeedTitle
  );
  let initCollect = feedManage.initCollect().catch(e => {
    throw Error(e);
  });
  return initCollect;
};

export default serveFeed;

/*
  feedSource[sourceT&itle]["lastfetch"] = Date.now();
  feedSource[sourceTitle]["feedLength"] = feedLength;
  return new Promise((resolve, reject) => {
    fs.writeFile(
      path.join(rootPath, "/feedNew.json"),
      JSON.stringify(feedSource),
      (e, r) => {
        if (e) return reject(e);
        return resolve(true);
      }
    );
  });
  */
