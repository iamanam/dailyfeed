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

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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

var getFeedSourceInfo = exports.getFeedSourceInfo = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2() {
    var data, f, result;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            data = [];
            _context2.prev = 1;

            f = function f(i) {
              return _initDb.docClient.get({
                TableName: "FeedSourceInfo",
                Key: { sourceTitle: i }
              }).promise();
            };

            Object.keys(_source2.default).map(function () {
              var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(i) {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        data.push(f(i));

                      case 1:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee, this);
              }));

              return function (_x) {
                return _ref2.apply(this, arguments);
              };
            }());
            _context2.next = 6;
            return Promise.all(data);

          case 6:
            result = _context2.sent;
            _context2.next = 13;
            break;

          case 9:
            _context2.prev = 9;
            _context2.t0 = _context2["catch"](1);

            console.log(_context2.t0);
            return _context2.abrupt("return", _context2.t0);

          case 13:
            return _context2.abrupt("return", result);

          case 14:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this, [[1, 9]]);
  }));

  return function getFeedSourceInfo() {
    return _ref.apply(this, arguments);
  };
}();