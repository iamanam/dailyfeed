import config from "../../config/config.json";
var AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: config.local.db.key_id,
  secretAccessKey: config.local.db.access_key,
  region: config.local.db.region,
  endpoint: config.local.db.endpoint
});

export var dyn = new AWS.DynamoDB();

export var docClient = new AWS.DynamoDB.DocumentClient();
