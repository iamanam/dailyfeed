"use strict";

var _service = require("./src/service");

var _service2 = _interopRequireDefault(_service);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = require("../config/config.json");
module.exports = new _service2.default(config.updating.autoUpdateTime); // intilize the service
//# sourceMappingURL=worker.js.map