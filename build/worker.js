"use strict";

require("babel-polyfill");

var AutoService = require("./src/service");
var config = require("../config/config.json");
var updateService = new AutoService(config.updating.autoUpdateTime); // intilize the service
updateService.runService(); // run the servie at initial startup
updateService.deleteOldSource();
//# sourceMappingURL=worker.js.map