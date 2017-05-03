const path = require("path");
var base = process.env.PWD;
const webpack = require("webpack");
var HtmlWebpackPlugin = require("html-webpack-plugin");
// var AssetsPlugin = require('assets-webpack-plugin')
module.exports = {
  entry: {
    app: [
      "react-hot-loader/patch",
      "webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000",
      path.join(base, "client", "index")
    ]
  },
  devtool: "eval",
  output: {
    filename: "bundle.js",
    path: path.join(__dirname, "www"),
    publicPath: "/assets/"
  },
  plugins: [
    // added this thing!
    new webpack.DefinePlugin({
      "process.env.NODE_ENV": '"development"',
      PRODUCTION: JSON.stringify(false)
    }),
    new (webpack.optimize.OccurenceOrderPlugin ||
      webpack.optimize.OccurrenceOrderPlugin)(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.NamedModulesPlugin(),
    new HtmlWebpackPlugin({
      filename: path.join(base, "index.html"),
      template: path.join(__dirname, "client", "/main.html")
    })
    // new AssetsPlugin()
    // new HtmlWebpackPlugin({title: "React express", template: "public/template.ejs"})
  ],
  resolve: {
    extensions: [".js", ".jsx", ".json", ",", ".map"]
  },
  module: {
    loaders: [
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: "graphql-tag/loader"
      },
      {
        test: /\.(jsx|js)$/,
        exclude: /(node_modules|bower_components)/,
        loader: ["react-hot-loader/webpack", "babel-loader"],
        include: path.join(__dirname)
      },
      {
        test: /\.(less|css)$/,
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
