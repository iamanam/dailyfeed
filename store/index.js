import source from "../config/source.json";
//import fetchInfo from "./fetchInfo.json";
import fs from "fs";
import path from "path";
export const getSource = sourceTitle => {
  //console.log(source[sourceTitle]);
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
