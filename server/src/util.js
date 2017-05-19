// import path from 'path' import fs from 'fs'
import fetch from "isomorphic-fetch";
require("es6-promise").polyfill();
// const rootPath = process.env.rootPath || path.join(__dirname, '..', '..')

/**
 * This function will fetch xml source from source url with the help of isomorphic-fetch
 * @param {string} sourceUrl
 * @returns stream
 */
const _fetch = sourceUrl => {
  return fetch(sourceUrl, {
    "cache-control": "max-age=0",
    pragma: "no-cache"
  }).then((res, err) => {
    /*
    if (res.status === 200) {
      return res
    }
    */
    return res;
  });
};

export { _fetch };
