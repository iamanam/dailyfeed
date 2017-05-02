"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var AWS = require("aws-sdk");
AWS.config.update({
  accessKeyId: process.env.key_id,
  secretAccessKey: process.env.access_key,
  endpoint: process.env.endpoint,
  region: "ap-south-1"
});

var dyn = exports.dyn = new AWS.DynamoDB();
var docClient = exports.docClient = new AWS.DynamoDB.DocumentClient();
;

var _temp = function () {
  if (typeof __REACT_HOT_LOADER__ === 'undefined') {
    return;
  }

  __REACT_HOT_LOADER__.register(dyn, "dyn", "server/db/initDb.js");

  __REACT_HOT_LOADER__.register(docClient, "docClient", "server/db/initDb.js");
}();

;
//# sourceMappingURL=initDb.js.map