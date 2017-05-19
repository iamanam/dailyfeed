function createTableIfNotExist(tableName) {
  try {
    async function checkTables(tableName) {
      let tables = await listTables().promise();
      return tables["TableNames"].includes(tableName);
    }
    checkTables(tableName).then(r => {
      if (!r) {
        return createTable(FeedTypeTable(tableName));
      }
      console.log("%s table exist", tableName);
    });
  } catch (e) {
    console.log(e);
  }
}
