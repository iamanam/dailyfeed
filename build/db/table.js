"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var FeedSourceInfo = exports.FeedSourceInfo = {
  TableName: "FeedSourceInfo",
  AttributeDefinitions: [{ AttributeName: "sourceTitle", AttributeType: "S" }],
  KeySchema: [{ AttributeName: "sourceTitle", KeyType: "HASH" }],
  GlobalSecondaryIndexes: [{
    IndexName: "findBySourceInfoByTitle",
    KeySchema: [{ AttributeName: "sourceTitle", KeyType: "HASH" }],
    Projection: {
      ProjectionType: "ALL"
    },
    ProvisionedThroughput: {
      ReadCapacityUnits: 2,
      WriteCapacityUnits: 2
    }
  }],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  }
};

var FeedSource = exports.FeedSource = {
  TableName: "FeedSource",
  AttributeDefinitions: [{ AttributeName: "sourceTitle", AttributeType: "S" }],
  KeySchema: [{ AttributeName: "sourceTitle", KeyType: "HASH" }],
  GlobalSecondaryIndexes: [{
    IndexName: "findBySourceTitle",
    KeySchema: [{ AttributeName: "sourceTitle", KeyType: "HASH" }],
    Projection: {
      ProjectionType: "ALL"
    },
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  }],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  }
};

var FeedReadMain = exports.FeedReadMain = {
  TableName: "FeedReadMain",
  AttributeDefinitions: [{ AttributeName: "userName", AttributeType: "S" }, { AttributeName: "deviceId", AttributeType: "S" }],
  KeySchema: [{ AttributeName: "userName", KeyType: "HASH" }, { AttributeName: "deviceId", KeyType: "RANGE" }],
  GlobalSecondaryIndexes: [{
    IndexName: "findByUserName",
    KeySchema: [{ AttributeName: "userName", KeyType: "HASH" }, { AttributeName: "deviceId", KeyType: "RANGE" }],
    Projection: {
      ProjectionType: "ALL"
    },
    ProvisionedThroughput: {
      ReadCapacityUnits: 5,
      WriteCapacityUnits: 5
    }
  }],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  }
};

var indexName = exports.indexName = function indexName(tableName) {
  var indexInfo = {
    FeedReadMain: "findByUserName",
    FeedSource: "findBySourceTitle",
    FeedSourceInfo: "findBySourceInfoByTitle"
  };
  return indexInfo[tableName];
};

function createTable(dyn, tableName) {
  dyn.createTable(tableName, function (error, data) {
    if (error) console.log(error);else {
      console.log(data);
    }
  });
}

var _default = createTable;
exports.default = _default;
;

var _temp = function () {
  if (typeof __REACT_HOT_LOADER__ === 'undefined') {
    return;
  }

  __REACT_HOT_LOADER__.register(FeedSourceInfo, "FeedSourceInfo", "server/db/table.js");

  __REACT_HOT_LOADER__.register(FeedSource, "FeedSource", "server/db/table.js");

  __REACT_HOT_LOADER__.register(FeedReadMain, "FeedReadMain", "server/db/table.js");

  __REACT_HOT_LOADER__.register(indexName, "indexName", "server/db/table.js");

  __REACT_HOT_LOADER__.register(createTable, "createTable", "server/db/table.js");

  __REACT_HOT_LOADER__.register(_default, "default", "server/db/table.js");
}();

;
//# sourceMappingURL=table.js.map