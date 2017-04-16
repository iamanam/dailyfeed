import CollectFeed from "./collectFeed";
import fs from "fs";
import path from "path";
import source from "./feedSource";
let feedSource = JSON.parse(JSON.stringify(source));
const rootPath = process.env.rootPath || path.join(__dirname, "..", "..");

const saveFetchInfo = (sourceTitle, feedLength) => {
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
