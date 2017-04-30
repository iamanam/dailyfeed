"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _through = require("through2");

var _through2 = _interopRequireDefault(_through);

var _feedparser = require("feedparser");

var _feedparser2 = _interopRequireDefault(_feedparser);

var _util = require("./util");

var _index = require("../../store/index");

var _config = require("../../config/config.json");

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var rootPath = process.env.rootPath || _path2.default.join(__dirname, "..", "..");
var Promise = require("bluebird");

/**
 * This function scrap details text of each news feed while autoupdating
 * Scarping is done by a custom node modules by cherrioreq.
 * @param {string} itemUrl - Url of the news sources for specific news feed
 * @param {any} scrapeIdentity - The tag contains the details of the new we interested.
 * @returns promise
 */
var scrapDescription = function scrapDescription(itemUrl, scrapeIdentity) {
  var cheerioReq = require("cheerio-req");
  return new Promise(function (resolve) {
    cheerioReq(itemUrl, function (err, $) {
      var totalNews = [];
      if (err) console.log(err);
      var $links = $(scrapeIdentity);
      for (var i = 0; i < $links.length; ++i) {
        totalNews.push($links.eq(i).text());
      }
      resolve(totalNews);
    });
  });
};

var altDes = function altDes(item) {
  var htmlToText = require("html-to-text");
  return htmlToText.fromString(item.description || item["content:encoded"][1] || "no description available", {
    hideLinkHrefIfSameAsText: true,
    ignoreHref: true,
    ignoreImage: true
  });
};
/**
 * This will exculde only the required information form stream source for each feed
 * and return a formated version of feed
 * @param {object} item
 * @returns object
 */
var formatItem = async function formatItem(item, scrapeIdentity) {
  if (item && (typeof item === "undefined" ? "undefined" : _typeof(item)) === "object") {
    var descriptin = void 0;
    if (_config2.default.local.newsSetting.scrapping) {
      descriptin = await scrapDescription(item.link, scrapeIdentity); // this is the main description fetched from main site
    } else descriptin = altDes(item); // this is the short descriptin comes from feed after normalize html signs

    // finding an image from feed is bit of problem, so needed to go through some
    // extra mechanism
    var img = item["rss:image"];
    if (img) {
      var tag = img["#"] === undefined ? img["url"] ? img["url"]["#"] : "none" : img["#"];
    }
    var result = await {
      title: item.title,
      description: descriptin,
      pubDate: item.pubDate,
      image: tag,
      link: item.link
    };
    return result;
  }
  throw Error("item feeds cant be formatted");
};

var CollectFeed = function CollectFeed(sourceTitle, sourceUrl, lastFirstFeedTitle) {
  var _this = this;

  this.sourceUrl = sourceUrl;
  this.sourceTitle = sourceTitle;
  this.scrapTag = (0, _index.getSource)(sourceTitle).jsonFile;
  this.feedCollection = [];
  this.fetch = _util._fetch;
  this.writeFile = function (fileName, fileToWrite) {
    try {
      if (typeof fileToWrite !== "undefined") {
        _fsExtra2.default.writeJson(_path2.default.join(rootPath, "store", _this.sourceTitle, fileName + ".json"), fileToWrite);
        console.log("Feed parsed from %s", _this.sourceTitle);
      }
    } catch (e) {
      console.log(e);
    }
  };
  this.processWrite = function (fileName, dataToWrite) {
    var self = _this;
    var fileFolder = _path2.default.join(rootPath, "store", _this.sourceTitle);
    _fsExtra2.default.ensureDir(fileFolder, function (e) {
      self.writeFile(fileName, dataToWrite);
    });
  };
  var self = this;
  this.formatXml = function (Response) {
    return new Promise(function (resolve, reject) {
      var feedCollection = {};
      return Response.pipe(new _feedparser2.default()).pipe(_through2.default.obj(function (chunk, enc, callback) {
        var _this2 = this;

        // here it will cross check with old feed first item with newly chunked from stream
        // if old feed first item title is equal with new first source item then we will cancel
        // fetching as there is nothing new to update
        if (chunk.title === lastFirstFeedTitle) {
          return resolve({ isUpdateAvailable: false });
        }
        // if new items available then process will be continued
        new Promise(function (resolve, reject) {
          resolve(formatItem(chunk, self.scrapTag));
        }).then(function (v) {
          _this2.push(v);
          callback();
        });
      })).on("error", function (e) {
        throw Error(e);
      }).on("data", function (data) {
        feedCollection[data.title] = data;
      }).on("end", function () {
        var timeNow = Date.now(); // this time will use as a refrence into file name

        _this.processWrite(timeNow, feedCollection);
        resolve({
          feedsLength: Object.keys(feedCollection).length,
          fileName: timeNow + ".json",
          feeds: feedCollection,
          isUpdateAvailable: true
        });
      });
    });
  };

  this.initCollect = async function () {
    try {
      var getXml = await self.fetch(sourceUrl);
      var processXml = await self.formatXml(getXml.body);
      return processXml;
    } catch (error) {
      throw Error(error);
    }
  };
};
/*
    return new Promise((resolve, reject) => {
      self.fetch(sourceUrl).then(response => {
        if (response.status === 200) {
          return resolve(response.body);
        }
        reject(response.status);
      });
    }).then(response => {
      return Promise.resolve(self.formatXml(response));
    });
    */

exports.default = CollectFeed;