"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._fetch = undefined;

var _isomorphicFetch = require("isomorphic-fetch");

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require("es6-promise").polyfill();
// const rootPath = process.env.rootPath || path.join(__dirname, '..', '..')

/**
 * This function will fetch xml source from source url with the help of isomorphic-fetch
 * @param {string} sourceUrl
 * @returns stream
 */
// import path from 'path' import fs from 'fs'
var _fetch = function _fetch(sourceUrl) {
  return (0, _isomorphicFetch2.default)(sourceUrl).then(function (res, err) {
    /*
    if (res.status === 200) {
      return res
    }
    */
    return res;
  });
};

exports._fetch = _fetch;
;

var _temp = function () {
  if (typeof __REACT_HOT_LOADER__ === 'undefined') {
    return;
  }

  __REACT_HOT_LOADER__.register(_fetch, "_fetch", "server/src/util.js");
}();

;
//# sourceMappingURL=util.js.map