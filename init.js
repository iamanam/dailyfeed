require("babel-polyfill");
require("babel-register");
const path = require("path");
process.env.rootPath = path.join(__dirname);

require("./server/index.js");
