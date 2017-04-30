const path = require("path");
process.env.rootPath = path.join(__dirname);

if (process.argv.pop() === "dev" || "--dev") {
  process.env.env = "dev";
  process.env.isDevelopment = true;
} else {
  process.env.env = "production";
  process.env.isDevelopment = false;
}
require("./server/index.js");
