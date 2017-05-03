"use strict";

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _helper = require("./db/helper");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _promise2.default(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _promise2.default.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var AutoService = require("./src/service");
var compression = require("compression");
var path = require("path");
var express = require("express");
var app = express();
app.use(compression());
var config = require("../config/config.json");
var moment = require("moment");
process.env.rootPath = path.join(__dirname, "..");
var rootPath = process.env.rootPath;

// setting files of static to server easily
app.use(express.static(path.join(rootPath, "client")));
app.use(express.static(path.join(rootPath, "store")));

// -------------import routing Include server routes as a middleware

app.get("/", function (req, res, next) {
  res.sendFile("./index.html", { root: rootPath });
});

if (config.updating.autoUpdateFeed) {
  var updateService = new AutoService(config.updating.autoUpdateTime); // intilize the service
  setTimeout(function () {
    return updateService.runService();
  }, 10000); // run the servie at initial startup
  setInterval(function () {
    return updateService.deleteOldSource();
  }, 60000 * 60 * 6);
  setInterval(function () {
    return updateService.runService();
  }, config.updating.autoUpdateTime * 60000); // run service at specific intercal set in config

  app.get("/source_info", function () {
    var _ref = _asyncToGenerator(_regenerator2.default.mark(function _callee(req, res, next) {
      var info;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return (0, _helper.getFeedSourceInfo)();

            case 2:
              info = _context.sent;

              info.map(function (item) {
                var old = item["Item"]["lastFetched"];
                item["Item"]["lastFetched"] = moment(old).calendar();
              });
              if (info) res.json(info);

            case 5:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function (_x, _x2, _x3) {
      return _ref.apply(this, arguments);
    };
  }());

  /*
  app.get("/latest/:feedSource", function(req, res, next) {
    let sourceName = req.params.feedSource;
    if (req.params && sourceName !== "" && typeof sourceName === "string")
      return res.json({
        serviceRunning: updateService.serviceRunnng,
        nextUpdate: moment(updateService.nextUpdate).fromNow(),
        items: updateService.updatedMerge[req.params.feedSource]
      });
    console.error("Invalid request!!");
    next();
  });
  app.get("/next_update", function(req, res, next) {
    res.json({
      error: updateService.error,
      serviceRunning: updateService.serviceRunnng,
      nextUpdate: moment(updateService.nextUpdate).fromNow(),
      feeds: updateService.updatedMerge
    });
  });
  */
} // end of #if config.update.AutoupdateFeed

var server = require("http").createServer(app);

if (process.env.NODE_ENV === "development") {
  require("pretty-error").start();
  var reload = require("reload");
  reload(server, app);
  require(path.join(path.join(rootPath, "./dev-server")))(app);
} else {
  app.use(express.static(path.join(rootPath, "www")));
}

app.set("port", process.env.PORT || 3000);
app.set("host", process.env.HOST || "localhost");

server.listen(app.get("port"), function () {
  console.log("%s server listening at http://%s:%s", process.env.NODE_ENV, app.get("host"), app.get("port"));
});
//# sourceMappingURL=index.js.map