"use strict";

require("babel-polyfill");

var AutoService = require("./src/service");
var config = require("../config/config.json");
var updateService = new AutoService(config.updating.autoUpdateTime); // intilize the service
updateService.runService(); // run the servie at initial startup
updateService.deleteOldSource();
;

var _temp = function () {
  if (typeof __REACT_HOT_LOADER__ === 'undefined') {
    return;
  }

  __REACT_HOT_LOADER__.register(updateService, "updateService", "server/worker.js");
}();

;
//# sourceMappingURL=worker.js.map