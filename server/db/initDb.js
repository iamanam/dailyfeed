var AWS = require("aws-sdk");
AWS.config.update({
  accessKeyId: process.env.key_id,
  secretAccessKey: process.env.access_key,
  endpoint: process.env.endpoint,
  region: "ap-south-1"
});

export var dyn = new AWS.DynamoDB();
export var docClient = new AWS.DynamoDB.DocumentClient();
