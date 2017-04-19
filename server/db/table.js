export const FeedSourceInfo = {
  TableName: "FeedSourceInfo",
  AttributeDefinitions: [{ AttributeName: "sourceTitle", AttributeType: "S" }],
  KeySchema: [{ AttributeName: "sourceTitle", KeyType: "HASH" }],
  GlobalSecondaryIndexes: [
    {
      IndexName: "findBySourceInfoByTitle",
      KeySchema: [{ AttributeName: "sourceTitle", KeyType: "HASH" }],
      Projection: {
        ProjectionType: "ALL"
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 2,
        WriteCapacityUnits: 2
      }
    }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  }
};

export const FeedSource = {
  TableName: "FeedSource",
  AttributeDefinitions: [{ AttributeName: "sourceTitle", AttributeType: "S" }],
  KeySchema: [{ AttributeName: "sourceTitle", KeyType: "HASH" }],
  GlobalSecondaryIndexes: [
    {
      IndexName: "findBySourceTitle",
      KeySchema: [{ AttributeName: "sourceTitle", KeyType: "HASH" }],
      Projection: {
        ProjectionType: "ALL"
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  }
};

export const FeedReadMain = {
  TableName: "FeedReadMain",
  AttributeDefinitions: [
    { AttributeName: "userName", AttributeType: "S" },
    { AttributeName: "deviceId", AttributeType: "S" }
  ],
  KeySchema: [
    { AttributeName: "userName", KeyType: "HASH" },
    { AttributeName: "deviceId", KeyType: "RANGE" }
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: "findByUserName",
      KeySchema: [
        { AttributeName: "userName", KeyType: "HASH" },
        { AttributeName: "deviceId", KeyType: "RANGE" }
      ],
      Projection: {
        ProjectionType: "ALL"
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5
  }
};

export const indexName = tableName => {
  var indexInfo = {
    FeedReadMain: "findByUserName",
    FeedSource: "findBySourceTitle",
    FeedSourceInfo: "findBySourceInfoByTitle"
  };
  return indexInfo[tableName];
};

function createTable(dyn, tableName) {
  dyn.createTable(tableName, (error, data) => {
    if (error) console.log(error);
    else {
      console.log(data);
    }
  });
}

export default createTable;
