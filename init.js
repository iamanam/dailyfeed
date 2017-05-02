require("babel-polyfill");
const path = require("path");
process.env.rootPath = path.join(__dirname);
if (process.argv.pop() === "dev") {
  require("./dev-server");
}
require("./build/index.js");
