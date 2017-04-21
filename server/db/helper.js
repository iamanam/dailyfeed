import { dyn, docClient } from "./initDb";
import { indexName } from "./table";

export const deletTable = (dyn, tableName) => {
  dyn.deleteTable(
    {
      TableName: tableName
    },
    e => console.log(e)
  );
};

export const putItem = (dyn, table, data) => {
  var Data = {
    TableName: table,
    Item: data
  };
  dyn.put(Data, (e, r) => console.log(e, r));
};

/**
 * query on Dyno based on condtion
 * @param {any} dyn 
 * @param {any} tableName 
 * @param {any} condition 
 * @param {any} conditionJson 
 * @returns 
 */
export const query = (dyn, tableName, condition, conditionJson) => {
  return new Promise((resolve, reject) => {
    dyn.query(
      {
        TableName: tableName,
        IndexName: indexName(tableName),
        KeyConditionExpression: condition + " = :" + condition,
        ExpressionAttributeValues: conditionJson
      },
      (e, r) => {
        if (e) {
          reject(e);
        }
        resolve(r);
      }
    );
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

export const getItem = (TableName, keyJson) => {
  return docClient.get(
    {
      TableName: TableName,
      Key: keyJson
    },
    function(err, data) {
      if (err) {
        console.error(
          "Unable to read item. Error JSON:",
          JSON.stringify(err, null, 2)
        );
      } else {
        //console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
        return data;
      }
    }
  );
};

export const updateItem = params => {
  return docClient.update(params, function(err, data) {
    if (err) {
      console.error(
        "Unable to update item. Error JSON:",
        JSON.stringify(err, null, 2)
      );
    }
  });
};
