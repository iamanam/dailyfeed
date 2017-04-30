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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
        var promiseBind = function () {
          var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(key) {
            var feed;
            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    feed = {};
                    _context.next = 3;
                    return (0, _serveFeed2.default)(key, self.latestUpdates || {});

                  case 3:
                    feed[key] = _context.sent;
                    return _context.abrupt("return", Promise.resolve(feed));

                  case 5:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee, this);
          }));

          return function promiseBind(_x) {
            return _ref2.apply(this, arguments);
          };
        }();
        /*
              fs.stat(this.getPath(key, "index.json"), (e, c) => {
            if (e) return console.error(e);
            let updateInterval = config.updating.autoUpdateTime * 60000;
            if (Date.parse(c.mtime) + updateInterval >= Date.now())
              console.log("Updating ignored.");
            else ;
          });
          */


        var self, allPromises, key;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                self = this;
                allPromises = [];

                for (key in _source2.default) {
                  allPromises.push(promiseBind(key));
                }
                return _context2.abrupt("return", Promise.all(allPromises));

              case 4:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function fetchUpdateForAll() {
        return _ref.apply(this, arguments);
      }

      return fetchUpdateForAll;
    }()

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
    value: function () {
      var _ref3 = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(param) {
        var self, fetchUpdateAll;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                self = this;
                _context4.prev = 1;

                self.serviceRunnng = "true";
                // at first delete outdated json files before merging occur
                // self.deleteOldSource();
                // now fetch latest updates
                _context4.next = 5;
                return this.fetchUpdateForAll();

              case 5:
                fetchUpdateAll = _context4.sent;

                // after update finish then merge latest feeds with old feeds for each different source
                fetchUpdateAll.map(function () {
                  var _ref4 = _asyncToGenerator(regeneratorRuntime.mark(function _callee3(feedUpdate) {
                    var keyName, mergedFeeds;
                    return regeneratorRuntime.wrap(function _callee3$(_context3) {
                      while (1) {
                        switch (_context3.prev = _context3.next) {
                          case 0:
                            keyName = Object.keys(feedUpdate)[0];
                            // start merging

                            _context3.next = 3;
                            return self.mergeEach(keyName, // source title
                            feedUpdate[keyName] // source values as feeds
                            );

                          case 3:
                            mergedFeeds = _context3.sent;

                            if (!mergedFeeds) {
                              _context3.next = 6;
                              break;
                            }

                            return _context3.abrupt("return", self.writeData(keyName, mergedFeeds));

                          case 6:
                            return _context3.abrupt("return", self.writeData(keyName, feedUpdate[keyName]));

                          case 7:
                          case "end":
                            return _context3.stop();
                        }
                      }
                    }, _callee3, this);
                  }));

                  return function (_x3) {
                    return _ref4.apply(this, arguments);
                  };
                }());
                _context4.next = 12;
                break;

              case 9:
                _context4.prev = 9;
                _context4.t0 = _context4["catch"](1);

                console.log(_context4.t0);

              case 12:
                _context4.prev = 12;

                self.serviceRunnng = "false";
                self.nextUpdate = Date.now() + 60000 * _config2.default.updateInterval;
                return _context4.finish(12);

              case 16:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[1, 9, 12, 16]]);
      }));

      function runService(_x2) {
        return _ref3.apply(this, arguments);
      }

      return runService;
    }()
  }]);

  return AutoService;
}();

exports.default = AutoService;