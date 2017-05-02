require("babel-polyfill");
var updateService = require("./build/worker");
updateService.runService(); // run the servie at initial startup
updateService.deleteOldSource();
console.log(updateService.updatedMerge);
