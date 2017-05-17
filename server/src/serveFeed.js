import CollectFeed from "./collectFeed";
const source = process.env.NODE_ENV === "development"
  ? require("../../config/source.json")
  : require("../../config/source_pro.json");

let feedSource = JSON.parse(JSON.stringify(source));

/**
 * It will fetch the feeds and parse it & save it as json
 * Souce can be user specific souce or all souce which saved by defualt
 * @param {object} source
 */
const serveFeed = (sourceTitle, lastUpdate) => {
  if (lastUpdate[sourceTitle]) {
    var lastFirstFeedTitle = Object.keys(lastUpdate[sourceTitle]["feeds"])[0]; // title of first item of last fetched feed item
  }
  let feedManage = new CollectFeed(
    sourceTitle,
    feedSource[sourceTitle].sourceUrl, // get sourceinfo from saved json file
    lastFirstFeedTitle
  );
  let initCollect = feedManage.initCollect().catch(e => {
    throw Error(e);
  });
  return initCollect;
};

export default serveFeed;
