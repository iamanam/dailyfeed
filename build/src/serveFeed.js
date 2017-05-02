"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _collectFeed = require("./collectFeed");

var _collectFeed2 = _interopRequireDefault(_collectFeed);

var _source = require("../../config/source.json");

var _source2 = _interopRequireDefault(_source);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var feedSource = JSON.parse(JSON.stringify(_source2.default));

/*
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
*/

/**
 * It will fetch the feeds and parse it & save it as json
 * Souce can be user specific souce or all souce which saved by defualt
 * @param {object} source
 */
var serveFeed = function serveFeed(sourceTitle, lastUpdate) {
  if (lastUpdate[sourceTitle]) {
    var lastFirstFeedTitle = Object.keys(lastUpdate[sourceTitle]["feeds"])[0]; // title of first item of last fetched feed item
  }
  var feedManage = new _collectFeed2.default(sourceTitle, feedSource[sourceTitle].sourceUrl, // get sourceinfo from saved json file
  lastFirstFeedTitle);
  var initCollect = feedManage.initCollect().catch(function (e) {
    throw Error(e);
  });
  return initCollect;
};

var _default = serveFeed;
exports.default = _default;

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

;

var _temp = function () {
  if (typeof __REACT_HOT_LOADER__ === 'undefined') {
    return;
  }

  __REACT_HOT_LOADER__.register(feedSource, "feedSource", "server/src/serveFeed.js");

  __REACT_HOT_LOADER__.register(serveFeed, "serveFeed", "server/src/serveFeed.js");

  __REACT_HOT_LOADER__.register(_default, "default", "server/src/serveFeed.js");
}();

;
//# sourceMappingURL=serveFeed.js.map