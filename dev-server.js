const webpack = require("webpack");
const webpackDevMiddleware = require("webpack-dev-middleware");
const webpackHotMiddleware = require("webpack-hot-middleware");
const config = require("./webpack.config.js");
const compiler = webpack(config);

/*
{
  "presets": [
    "latest",
    "react"
  ],
  "plugins": [
    "react-hot-loader/babel"
  ]
}
*/
const HotReload = app => {
  app.use(
    webpackDevMiddleware(compiler, {
      hot: true,
      filename: "bundle.js",
      inline: true,
      publicPath: "/assets/",
      // stats: "errors-only",
      historyApiFallback: true
    })
  );

  app.use(
    webpackHotMiddleware(compiler, {
      log: console.log,
      path: "/__webpack_hmr",
      heartbeat: 10 * 1000
    })
  );
};

module.exports = HotReload;
