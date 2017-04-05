require('babel-core/register');
const path = require("path");
process.env.rootPath = path.join(__dirname);
require('./index.js');
