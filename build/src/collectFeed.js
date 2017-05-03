"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _iterator = require("babel-runtime/core-js/symbol/iterator");

var _iterator2 = _interopRequireDefault(_iterator);

var _symbol = require("babel-runtime/core-js/symbol");

var _symbol2 = _interopRequireDefault(_symbol);

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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
var formatItem = function () {
  var _ref = _asyncToGenerator(_regenerator2.default.mark(function _callee(item, scrapeIdentity) {
    var descriptin, img, tag, result;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            if (!(item && (typeof item === "undefined" ? "undefined" : _typeof(item)) === "object")) {
              _context.next = 15;
              break;
            }

            descriptin = void 0;

            if (!_config2.default.local.newsSetting.scrapping) {
              _context.next = 8;
              break;
            }

            _context.next = 5;
            return scrapDescription(item.link, scrapeIdentity);

          case 5:
            descriptin = _context.sent;
            _context.next = 9;
            break;

          case 8:
            descriptin = altDes(item);

          case 9:
            // this is the short descriptin comes from feed after normalize html signs

            // finding an image from feed is bit of problem, so needed to go through some
            // extra mechanism
            img = item["rss:image"];

            if (img) {
              tag = img["#"] === undefined ? img["url"] ? img["url"]["#"] : "none" : img["#"];
            }
            _context.next = 13;
            return {
              title: item.title,
              description: descriptin,
              pubDate: item.pubDate,
              image: tag,
              link: item.link
            };

          case 13:
            result = _context.sent;
            return _context.abrupt("return", result);

          case 15:
            throw Error("item feeds cant be formatted");

          case 16:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function formatItem(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

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
          feedsLength: (0, _keys2.default)(feedCollection).length,
          fileName: timeNow + ".json",
          feeds: feedCollection,
          isUpdateAvailable: true
        });
      });
    });
  };

  this.initCollect = _asyncToGenerator(_regenerator2.default.mark(function _callee2() {
    var getXml, processXml;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return self.fetch(sourceUrl);

          case 3:
            getXml = _context2.sent;
            _context2.next = 6;
            return self.formatXml(getXml.body);

          case 6:
            processXml = _context2.sent;
            return _context2.abrupt("return", processXml);

          case 10:
            _context2.prev = 10;
            _context2.t0 = _context2["catch"](0);
            throw Error(_context2.t0);

          case 13:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this, [[0, 10]]);
  }));
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
//# sourceMappingURL=collectFeed.js.map