import serveFeed from "../server/src/serveFeed";
import AutoService from "../server/src/service";
const path = require("path");
const express = require("express");
const app = express();
const reload = require("reload");
const config = require("../config/config.json");
const moment = require("moment");
var Promise = require("bluebird");

// require("../config/runDyno");
// var router = express.Router() const path = require("path")
const rootPath = process.env.rootPath;
// const serveFeed = require(path.join(rootPath, 'server/src', 'serveFeed.js'))
require("pretty-error").start();

// setting files of static to server easily
app.use(express.static(path.join(rootPath, "www")));
app.use(express.static(path.join(rootPath, "client")));
app.use(express.static(path.join(rootPath, "server")));
app.use(express.static(path.join(rootPath, "store")));

// -------------import routing Include server routes as a middleware
app.get("/", function(req, res, next) {
  res.sendFile("./index.html", { root: rootPath });
});

if (config.updating.autoUpdateFeed) {
  const updateService = new AutoService(config.updating.autoUpdateTime); // intilize the service
  setTimeout(() => updateService.runService(), 10000); // run the servie at initial startup
  setTimeout(() => updateService.deleteOldSource(), 20000);
  setInterval(
    () => updateService.runService(),
    config.updating.autoUpdateTime * 60000
  ); // run service at specific intercal set in config
  app.get("/next_update", function(req, res, next) {
    res.json({
      serviceRunning: updateService.serviceRunnng,
      nextUpdate: moment(updateService.nextUpdate).fromNow(),
      feeds: updateService.latestUpdates
    });
  });
  app.get("/latest/:feedSource", function(req, res, next) {
    res.json({
      serviceRunning: updateService.serviceRunnng,
      nextUpdate: moment(updateService.nextUpdate).fromNow(),
      items: updateService.latestUpdates[req.params.feedSource]
    });
  });
}

// this will serve updated json after fetching & saving it
app.get("/serveJson/:feedSource/:isUpdate", function(req, res, next) {
  new Promise((resolve, reject) => {
    resolve(serveFeed(req.params.feedSource, req.params.isUpdate));
  })
    .catch(e => {
      res.status(e).json({
        error: "Feed couldn't be fetched!! Check network or try later."
      });
    })
    .then(result => {
      res.status(200).send(result);
    });
});

var server = require("http").createServer(app);

if (process.env.isDevelopment) {
  reload(server, app);
  //require(path.join(path.join(rootPath, "./dev-server")))(app);
}

app.set("port", process.env.PORT || 3000);
app.set("host", process.env.HOST || "localhost");

server.listen(process.env.PORT, function() {
  console.log(
    "%s server listening at http://%s:%s",
    process.env.env,
    app.get("host"),
    app.get("port")
  );
});
