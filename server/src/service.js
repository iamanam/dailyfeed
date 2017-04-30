"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _serveFeed = require("./serveFeed");

var _serveFeed2 = _interopRequireDefault(_serveFeed);

var _source = require("../../config/source.json");

var _source2 = _interopRequireDefault(_source);

var _config = require("../../config/config.json");

var _config2 = _interopRequireDefault(_config);

var _findRemove = require("find-remove");

var _findRemove2 = _interopRequireDefault(_findRemove);

var _helper = require("../db/helper.js");

var _fsExtra = require("fs-extra");

var _fsExtra2 = _interopRequireDefault(_fsExtra);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var rootPath = process.env.rootPath || _path2.default.join(__dirname, "..", "..");
var Promise = require("bluebird");
var AutoService = function () {
  function AutoService(updateInterval) {
    _classCallCheck(this, AutoService);

    this.updateInterval = updateInterval; // this is config setting for update interval
    this.updatedMerge = {}; // this will hold the lates updateed merge
    this.minCounter = 0; // this will use to track passed min between instance
    this.nextUpdate = ""; // this will return the remaining time
    this.latestUpdates = {};
    this.serviceRunnng = "false";
  }

  _createClass(AutoService, [{
    key: "getPath",
    value: function getPath() {
      for (var _len = arguments.length, arg = Array(_len), _key = 0; _key < _len; _key++) {
        arg[_key] = arguments[_key];
      }

      return _path2.default.join.apply(_path2.default, [rootPath, "store"].concat(arg));
    }
  }, {
    key: "saveFetchInfo",
    value: function saveFetchInfo(sourceTitle, feedLength, fileName) {
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
      return (0, _helper.updateItem)(params);
    }
  }, {
    key: "writeData",
    value: function writeData(sourceTitle, dataToWrite) {
      // after merging happen feed length will change, so update the length
      dataToWrite.feedsLength = Object.keys(dataToWrite["feeds"]).length;
      try {
        // now save the fetching info in db
        this.saveFetchInfo(sourceTitle, dataToWrite.feedsLength, dataToWrite.fileName // its trick to find the latest file saved after index.json
        );
      } catch (e) {
        console.log(e);
      } finally {
        // add the lastest merged source for use later
        // now write the file in index.json
        _fsExtra2.default.writeJson(this.getPath(sourceTitle, "index.json"), dataToWrite, function (err) {
          if (err) return console.error("Index.json couldn't be saved. Reason :=> \n" + err);
          console.log("Index.json for %s saved!", sourceTitle);
        });
      }
    }
  }, {
    key: "mergeEach",
    value: function mergeEach(sourceTitle, latestFeedFetched) {
      var _this = this;

      var self = this;
      return new Promise(function (resolve) {
        // find store folder for each source feed
        _fsExtra2.default.readdir(_this.getPath(sourceTitle), function (err, res) {
          // if err or file in dir is less than one then write latest latestFeedFetched as index.json
          if (err || res.length === 0) {
            return _this.writeData(sourceTitle, latestFeedFetched);
          }
          // if there are more files then merge and write it in index.json
          try {
            if ((typeof res === "undefined" ? "undefined" : _typeof(res)) === "object" && res.length >= 1) {
              // let fileMergeTotal = {};
              res.reverse().map(function (file) {
                if (file === "index.json") return; // need to ignore index file as its our destination writie
                var getFile = _this.getPath(sourceTitle, file);
                if (getFile || getFile !== "" || typeof getFile !== "undefined") {
                  // merge only feeds, so we keeping intact other properties of lastfetched while merging feeds only
                  latestFeedFetched["feeds"] = Object.assign({}, latestFeedFetched["feeds"], _fsExtra2.default.readJsonSync(getFile));
                }
              });
              // save updated latestfetched after merged saved as backup
              self.updatedMerge[sourceTitle] = latestFeedFetched;
              resolve(latestFeedFetched);
            }
          } catch (e) {
            // if any occur at file system or in merging then at least write latestFeed in index.json
            console.error("Error on Merging \n", e);
          }
        });
      });
    }

    /**
    * This function fetch update by calling the serveFeed method
    * It calls out all the source titles included and call the mergeEachSourceFile to merge lates feeds
    * It also return the feeds for all source <object data="" type=""></object>
    * @param {object} lastUpdate - The last successful update to compare it with latest update
    * @returns Promise
    */

  }, {
    key: "fetchUpdateForAll",
    value: async function fetchUpdateForAll() {
      var self = this;
      async function promiseBind(key) {
        var feed = {};
        feed[key] = await (0, _serveFeed2.default)(key, self.latestUpdates || {});
        return Promise.resolve(feed);
      }
      /*
            fs.stat(this.getPath(key, "index.json"), (e, c) => {
          if (e) return console.error(e);
          let updateInterval = config.updating.autoUpdateTime * 60000;
          if (Date.parse(c.mtime) + updateInterval >= Date.now())
            console.log("Updating ignored.");
          else ;
        });
        */
      var allPromises = [];
      for (var key in _source2.default) {
        allPromises.push(promiseBind(key));
      }
      return Promise.all(allPromises);
    }

    // after fetching files delete json files which is older than 12 hrs

  }, {
    key: "deleteOldSource",
    value: function deleteOldSource() {
      var result = (0, _findRemove2.default)(_path2.default.join(rootPath, "store"), {
        age: { seconds: 3600 * 12 }, // 12 hr
        maxLevel: 2,
        extensions: ".json"
      });
      console.log("Old json source file which were deleted :", result);
    }
  }, {
    key: "runService",
    value: async function runService(param) {
      var self = this;
      try {
        self.serviceRunnng = "true";
        // at first delete outdated json files before merging occur
        // self.deleteOldSource();
        // now fetch latest updates
        var fetchUpdateAll = await this.fetchUpdateForAll();
        // after update finish then merge latest feeds with old feeds for each different source
        fetchUpdateAll.map(async function (feedUpdate) {
          var keyName = Object.keys(feedUpdate)[0];
          // start merging
          var mergedFeeds = await self.mergeEach(keyName, // source title
          feedUpdate[keyName] // source values as feeds
          );
          // after successful merging write in db and updated feeds in index.json
          if (mergedFeeds) return self.writeData(keyName, mergedFeeds);
          // if mergefeeds failed, then as alternative write latest updates ignore old feeds
          return self.writeData(keyName, feedUpdate[keyName]);
        });
      } catch (e) {
        console.log(e);
      } finally {
        self.serviceRunnng = "false";
        self.nextUpdate = Date.now() + 60000 * _config2.default.updateInterval;
      }
    }
  }]);

  return AutoService;
}();

exports.default = AutoService;