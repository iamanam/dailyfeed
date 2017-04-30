import AutoService from "../server/src/service";
const config = require("../config/config.json");
const updateService = new AutoService(config.updating.autoUpdateTime); // intilize the service
updateService.runService(); // run the servie at initial startup
updateService.deleteOldSource();
