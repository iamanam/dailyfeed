const path = require("path");
var CompressionPlugin = require("compression-webpack-plugin");
var WebpackBundleSizeAnalyzerPlugin = require("webpack-bundle-size-analyzer")
  .WebpackBundleSizeAnalyzerPlugin;
var base = process.env.PWD;
const webpack = require("webpack");
var HtmlWebpackPlugin = require("html-webpack-plugin");
// var AssetsPlugin = require('assets-webpack-plugin')
module.exports = {
  entry: {
    app: [path.join(base, "client", "index")]
  },
  devtool: "cheap-module-source-map",
  // this is a default value; just be aware of it context: path.resolve(__dirname,
  // 'app'),
  output: {
    filename: "bundle.js",
    path: path.join(__dirname, "www"),
    publicPath: "./"
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": '"production"',
      PRODUCTION: JSON.stringify(true)
    }),
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.optimize.UglifyJsPlugin({
      mangle: true,
      compress: {
        warnings: false, // Suppress uglification warnings
        pure_getters: true,
        unsafe: true,
        unsafe_comps: true,
        screw_ie8: true
      },
      output: {
        comments: false
      },
      exclude: [/\.min\.js$/gi] // skip pre-minified libs
    }),
    // new webpack.IgnorePlugin(/^\.\/locale$/),
    new webpack.NoEmitOnErrorsPlugin(),
    new CompressionPlugin({
      asset: "[path].gz[query]",
      algorithm: "gzip",
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0
    }),
    new WebpackBundleSizeAnalyzerPlugin("../plain-report.txt"),
    new HtmlWebpackPlugin({
      // Also generate a test.html
      filename: path.join(__dirname, "/index.html"),
      template: path.join(__dirname, "client", "/main.html")
    })
  ],
  resolve: {
    extensions: [".js", ".jsx", ".json", ",", ".map"]
  },
  module: {
    loaders: [
      {
        test: /\.(jsx|js)$/,
        exclude: /(node_modules|bower_components)/,
        loader: ["babel-loader"],
        include: path.join(__dirname)
      },

      {
        test: /\.(css|less)$/,
        use: ["style-loader", "css-loader", "less-loader"]
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        loader: "url-loader",
        options: {
          limit: 10000
        }
      },
      {
        test: /\.json$/,
        loader: "json-loader"
      }
    ]
  }
};
