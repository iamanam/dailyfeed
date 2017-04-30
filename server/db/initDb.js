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