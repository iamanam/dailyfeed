const AutoService = require("./src/service");
const config = process.env.NODE_ENV === "development"
  ? require("../config/config.json")
  : require("../config/config_production.json");
const updateService = new AutoService(config.updating.autoUpdateTime); // intilize the service
updateService.runService(); // run the servie at initial startup
// updateService.deleteOldSource();
