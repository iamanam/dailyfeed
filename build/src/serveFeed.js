"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _stringify = require("babel-runtime/core-js/json/stringify");

var _stringify2 = _interopRequireDefault(_stringify);

var _collectFeed = require("./collectFeed");

var _collectFeed2 = _interopRequireDefault(_collectFeed);

var _source = require("../../config/source.json");

var _source2 = _interopRequireDefault(_source);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var feedSource = JSON.parse((0, _stringify2.default)(_source2.default));

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
    var lastFirstFeedTitle = (0, _keys2.default)(lastUpdate[sourceTitle]["feeds"])[0]; // title of first item of last fetched feed item
  }
  var feedManage = new _collectFeed2.default(sourceTitle, feedSource[sourceTitle].sourceUrl, // get sourceinfo from saved json file
  lastFirstFeedTitle);
  var initCollect = feedManage.initCollect().catch(function (e) {
    throw Error(e);
  });
  return initCollect;
};

exports.default = serveFeed;

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
//# sourceMappingURL=serveFeed.js.map