import "babel-polyfill";
import { getFeedSourceInfo } from "./db/helper";
const AutoService = require("./src/service");
var compression = require("compression");
const path = require("path");
const express = require("express");
const app = express();
app.use(compression());
const config = require("../config/config.json");
const moment = require("moment");
process.env.rootPath = path.join(__dirname, "..");
const rootPath = process.env.rootPath;

// setting files of static to server easily
app.use(express.static(path.join(rootPath, "www")));
app.use(express.static(path.join(rootPath, "client")));
app.use(express.static(path.join(rootPath, "store")));

// -------------import routing Include server routes as a middleware

app.get("/", function(req, res, next) {
  res.sendFile("./index.html", { root: rootPath });
});
app.get("/*.js", function(req, res, next) {
  req.url = req.url + ".gz";
  res.header("Content-Encoding", "gzip");
  next();
});
if (config.updating.autoUpdateFeed) {
  const updateService = new AutoService(config.updating.autoUpdateTime); // intilize the service
  setTimeout(() => updateService.runService(), 10000); // run the servie at initial startup
  setInterval(() => updateService.deleteOldSource(), 60000 * 60 * 6);
  setInterval(
    () => updateService.runService(),
    config.updating.autoUpdateTime * 60000
  ); // run service at specific intercal set in config

  app.get("/source_info", async function(req, res, next) {
    let info = await getFeedSourceInfo();
    info.map(item => {
      let old = item["Item"]["lastFetched"];
      item["Item"]["lastFetched"] = moment(old).calendar();
    });
    if (info) res.json(info);
  });

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
  const reload = require("reload");
  reload(server, app);
  require(path.join(path.join(rootPath, "./dev-server")))(app);
}

app.set("port", process.env.PORT || 3000);
app.set("host", process.env.HOST || "localhost");

server.listen(app.get("port"), function() {
  console.log(
    "%s server listening at http://%s:%s",
    process.env.NODE_ENV,
    app.get("host"),
    app.get("port")
  );
});
