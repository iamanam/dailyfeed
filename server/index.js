import serveFeed from "../server/src/serveFeed";
const path = require("path");
const express = require("express");
const app = express();
const reload = require("reload");
//require("../config/runDyno");
// var router = express.Router() const path = require("path")
const rootPath = process.env.rootPath;
// const serveFeed = require(path.join(rootPath, 'server/src', 'serveFeed.js'))

// setting files of static to server easily
app.use(express.static(path.join(rootPath, "client")));
app.use(express.static(path.join(rootPath, "server")));
app.use(express.static(path.join(rootPath, "store")));

// -------------import routing Include server routes as a middleware
app.get("/", function(req, res, next) {
  res.sendFile("./index.html", { root: rootPath });
});

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
  require(path.join(path.join(rootPath, "./dev-server")))(app);
}

app.set("port", process.env.PORT || 3000);
app.set("host", process.env.HOST || "localhost");

server.listen(3000, function() {
  console.log(
    "%s server listening at http://%s:%s",
    process.env.env,
    app.get("host"),
    app.get("port")
  );
});
