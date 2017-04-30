"use strict";

var _helper = require("./db/helper");

var _service = require("../server/src/service");

var _service2 = _interopRequireDefault(_service);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var path = require("path");
var express = require("express");
var app = express();
var config = require("../config/config.json");
var moment = require("moment");
// require("../config/runDyno");
var rootPath = process.env.rootPath;

// setting files of static to server easily
app.use(express.static(path.join(rootPath, "www")));
app.use(express.static(path.join(rootPath, "client")));
app.use(express.static(path.join(rootPath, "store")));

// -------------import routing Include server routes as a middleware
app.get("/", function (req, res, next) {
  res.sendFile("./index.html", { root: rootPath });
});

if (config.updating.autoUpdateFeed) {
  var updateService = new _service2.default(config.updating.autoUpdateTime); // intilize the service
  setTimeout(function () {
    return updateService.runService();
  }, 10000); // run the servie at initial startup
  //setTimeout(() => updateService.deleteOldSource(), 20000);
  setInterval(function () {
    return updateService.runService();
  }, config.updating.autoUpdateTime * 60000); // run service at specific intercal set in config
  app.get("/next_update", function (req, res, next) {
    res.json({
      error: updateService.error,
      serviceRunning: updateService.serviceRunnng,
      nextUpdate: moment(updateService.nextUpdate).fromNow(),
      feeds: updateService.updatedMerge
    });
  });
  app.get("/source_info", async function (req, res, next) {
    var info = await (0, _helper.getFeedSourceInfo)();
    if (info) res.json(info);
  });
  app.get("/latest/:feedSource", function (req, res, next) {
    var sourceName = req.params.feedSource;
    if (req.params && sourceName !== "" && typeof sourceName === "string") return res.json({
      serviceRunning: updateService.serviceRunnng,
      nextUpdate: moment(updateService.nextUpdate).fromNow(),
      items: updateService.updatedMerge[req.params.feedSource]
    });
    console.error("Invalid request!!");
    next();
  });
}

var server = require("http").createServer(app);
app.set("port", process.env.PORT || 3000);
app.set("host", process.env.HOST || "localhost");

server.listen(app.get("port"), function () {
  console.log("%s server listening at http://%s:%s", process.env.env, app.get("host"), app.get("port"));
});