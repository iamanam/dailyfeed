import CollectFeed from "./collectFeed";
import source from "./feedSource";
import { updateItem } from "../db/helper.js";
let feedSource = JSON.parse(JSON.stringify(source));

const saveFetchInfo = (sourceTitle, feedLength) => {
  var params = {
    TableName: "FeedSourceInfo",
    Key: {
      sourceTitle: sourceTitle
    },
    UpdateExpression: "set lastFetched =:dt, feedItem = :item",
    ExpressionAttributeValues: {
      ":dt": Date.now(),
      ":item": feedLength
    },
    ReturnValues: "UPDATED_NEW"
  };
  return updateItem(params);
  /*
  feedSource[sourceTitle]["lastfetch"] = Date.now();
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
};

/**
 * It will fetch the feeds and parse it & save it as json
 * Souce can be user specific souce or all souce which saved by defualt
 * @param {object} source
 */
const serveFeed = (sourceTitle, isUpdate) => {
  try {
    let getFeedSource = feedSource[sourceTitle];
    var feedManage = new CollectFeed(sourceTitle, getFeedSource.feedUrl);
    // data for saveFetch info
    feedManage.then(r => {
      saveFetchInfo(sourceTitle, JSON.parse(r)["items"].length).then(e =>
        console.log(e)
      );
    });
  } catch (e) {
    throw Error(e);
  }
  return feedManage;
};

export default serveFeed;
