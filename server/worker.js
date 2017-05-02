import AutoService from "./src/service";
const config = require("../config/config.json");
module.exports = new AutoService(config.updating.autoUpdateTime); // intilize the service
