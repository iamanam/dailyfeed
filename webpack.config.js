const path = require('path')
var base = process.env.PWD
const webpack = require('webpack')
// var HtmlWebpackPlugin = require('html-webpack-plugin')
// var AssetsPlugin = require('assets-webpack-plugin')
module.exports = {
  entry: {
    app: [
      'react-hot-loader/patch',
      // 'webpack-dev-server/client?http://localhost:9000/',
      'webpack-hot-middleware/client?path=/__webpack_hmr&timeout=20000',
      path.join(base, 'client', 'index')
    ]
  },
  devtool: 'eval-source-map',
  // this is a default value; just be aware of it context: path.resolve(__dirname,
  // 'app'),
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'www'),
    publicPath: '/assets/'
  },
  plugins: [
    // added this thing!
    new (webpack.optimize.OccurenceOrderPlugin || webpack.optimize.OccurrenceOrderPlugin)(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.NamedModulesPlugin()
  // new AssetsPlugin()
  // new HtmlWebpackPlugin({title: "React express", template: "public/template.ejs"})
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.json', ',', '.map']
  },
  module: {
    loaders: [
      {
        test: /\.(graphql|gql)$/,
        exclude: /node_modules/,
        loader: 'graphql-tag/loader'
      },
      {
        test: /\.(jsx|js)$/,
        exclude: /(node_modules|bower_components)/,
        loader: ['react-hot-loader/webpack', 'babel-loader'],
        include: path.join(__dirname)
      },
      {
        test: /\.(less|css)$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
        loader: 'url-loader',
        options: {
          limit: 10000
        }
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      }
    ]
  },
  devServer: {
    filename: 'bundle.js',
    // It's a required option.
    publicPath: 'http://localhost:9000/assets/',
    port: 9000,
    hot: true,
    stats: 'errors-only',
    inline: true
  }
}
