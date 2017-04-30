const path = require("path");
var base = process.env.PWD;
const webpack = require("webpack");
// var HtmlWebpackPlugin = require('html-webpack-plugin')
// var AssetsPlugin = require('assets-webpack-plugin')
module.exports = {
  entry: {
    app: [path.join(base, "client", "index")]
  },
  devtool: "devtool",
  // this is a default value; just be aware of it context: path.resolve(__dirname,
  // 'app'),
  output: {
    filename: "bundle.js",
    path: path.join(__dirname, "www"),
    publicPath: "/assets/"
  },
  plugins: [
    // added this thing!
    new (webpack.optimize.OccurenceOrderPlugin ||
      webpack.optimize.OccurrenceOrderPlugin)(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.NamedModulesPlugin(),
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify("production")
      }
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
        test: /\.(jsx|js)$/,
        exclude: /(node_modules|bower_components)/,
        loader: ["babel-loader"],
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
  },
  devServer: {
    filename: "bundle.js",
    // It's a required option.
    publicPath: "http://localhost:9000/assets/",
    port: 9000,
    hot: true,
    stats: "errors-only",
    inline: true
  }
};
