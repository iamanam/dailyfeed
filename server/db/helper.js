"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFeedSourceInfo = exports.updateItem = exports.getItem = exports.query = exports.putItem = exports.deletTable = undefined;

var _initDb = require("./initDb");

var _table = require("./table");

var _source = require("../../config/source.json");

var _source2 = _interopRequireDefault(_source);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var deletTable = exports.deletTable = function deletTable(dyn, tableName) {
  dyn.deleteTable({
    TableName: tableName
  }, function (e) {
    return console.log(e);
  });
};

var putItem = exports.putItem = function putItem(dyn, table, data) {
  var Data = {
    TableName: table,
    Item: data
  };
  dyn.put(Data, function (e, r) {
    return console.log(e, r);
  });
};

/**
 * query on Dyno based on condtion
 * @param {any} dyn 
 * @param {any} tableName 
 * @param {any} condition 
 * @param {any} conditionJson 
 * @returns 
 */
var query = exports.query = function query(dyn, tableName, condition, conditionJson) {
  return new Promise(function (resolve, reject) {
    dyn.query({
      TableName: tableName,
      IndexName: (0, _table.indexName)(tableName),
      KeyConditionExpression: condition + " = :" + condition,
      ExpressionAttributeValues: conditionJson
    }, function (e, r) {
      if (e) {
        reject(e);
      }
      resolve(r);
    });
  });
};

/* use of query
const userData = query(docClient, "FeedReadMain", "userName", {
  ":userName": "iamanam"
});

userData.then(v => {
  v["Items"].forEach(function(data) {
    console.log(data);
  }, this);
});
*/

var getItem = exports.getItem = function getItem(TableName, keyJson) {
  return _initDb.docClient.get({
    TableName: TableName,
    Key: keyJson
  }, function (err, data) {
    if (err) {
      console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
      //console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
      return data;
    }
  });
};

var updateItem = exports.updateItem = function updateItem(params) {
  return _initDb.docClient.update(params, function (err, data) {
    if (err) {
      console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
    }
  });
};

var getFeedSourceInfo = exports.getFeedSourceInfo = async function getFeedSourceInfo() {
  var data = [];
  try {
    var f = function f(i) {
      return _initDb.docClient.get({
        TableName: "FeedSourceInfo",
        Key: { sourceTitle: i }
      }).promise();
    };
    Object.keys(_source2.default).map(async function (i) {
      data.push(f(i));
    });
    var result = await Promise.all(data);
  } catch (e) {
    console.log(e);
    return e;
  }
  return result;
};