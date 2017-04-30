import { getFeedSourceInfo } from "./db/helper";
import AutoService from "../server/src/service";
const path = require("path");
const express = require("express");
const app = express();
const config = require("../config/config.json");
const moment = require("moment");
// require("../config/runDyno");
const rootPath = process.env.rootPath;

// setting files of static to server easily
app.use(express.static(path.join(rootPath, "www")));
app.use(express.static(path.join(rootPath, "client")));
app.use(express.static(path.join(rootPath, "store")));

// -------------import routing Include server routes as a middleware
app.get("/", function(req, res, next) {
  res.sendFile("./index.html", { root: rootPath });
});

if (config.updating.autoUpdateFeed) {
  const updateService = new AutoService(config.updating.autoUpdateTime); // intilize the service
  setTimeout(() => updateService.runService(), 10000); // run the servie at initial startup
  //setTimeout(() => updateService.deleteOldSource(), 20000);
  setInterval(
    () => updateService.runService(),
    config.updating.autoUpdateTime * 60000
  ); // run service at specific intercal set in config
  app.get("/next_update", function(req, res, next) {
    res.json({
      error: updateService.error,
      serviceRunning: updateService.serviceRunnng,
      nextUpdate: moment(updateService.nextUpdate).fromNow(),
      feeds: updateService.updatedMerge
    });
  });
  app.get("/source_info", async function(req, res, next) {
    let info = await getFeedSourceInfo();
    if (info) res.json(info);
  });
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
}

var server = require("http").createServer(app);

if (process.env.isDevelopment) {
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
    process.env.env,
    app.get("host"),
    app.get("port")
  );
});
