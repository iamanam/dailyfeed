const source = require("../config/source.json");
// const path = require("path");
// const fs = require("fs");

module.exports.getSource = function(sourceTitle) {
  if (sourceTitle) return source[sourceTitle];
  return source;
};

/*
export const getFetchInfo = () => {
  return fetchInfo;
};

export const updateFetchInfo = data => {
  console.log("old data is => \n ", fetchInfo);
  if (!data || typeof data !== "object") return;
  let newObject = Object.assign(fetchInfo, data);
  console.log("new data is => \n", newObject);
  return fs.writeFile(
    path.join(__dirname, "fetchInfo.json"),
    JSON.stringify(newObject),
    e => console.log(e)
  );
  // return newObject;
};
*/
