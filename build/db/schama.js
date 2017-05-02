"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Schama to save feedSource
 * @param {any} sourceTitle 
 * @param {any} sourceUrl 
 * @param {any} feedItem 
 * @param {any} scrapeIdentity 
 * @returns 
 */

var feedSourceSchama = exports.feedSourceSchama = function feedSourceSchama(sourceTitle, sourceUrl, scrapeIdentity) {
  return {
    sources: {
      sourceTitle: sourceTitle,
      sourceUrl: sourceUrl,
      scrapeIdentity: scrapeIdentity
    }
  };
};

var feedSourceInfoSchama = exports.feedSourceInfoSchama = function feedSourceInfoSchama(sourceTitle, feedItem) {
  return {
    sourceTitle: sourceTitle,
    lastFetched: Date.now(),
    feedItem: feedItem || "0"
  };
};

var feedSourceSchamaKeys = exports.feedSourceSchamaKeys = function feedSourceSchamaKeys() {
  return Object.keys(feedSourceSchama);
};

var _default = feedSourceSchama;
exports.default = _default;
;

var _temp = function () {
  if (typeof __REACT_HOT_LOADER__ === 'undefined') {
    return;
  }

  __REACT_HOT_LOADER__.register(feedSourceSchama, "feedSourceSchama", "server/db/schama.js");

  __REACT_HOT_LOADER__.register(feedSourceInfoSchama, "feedSourceInfoSchama", "server/db/schama.js");

  __REACT_HOT_LOADER__.register(feedSourceSchamaKeys, "feedSourceSchamaKeys", "server/db/schama.js");

  __REACT_HOT_LOADER__.register(_default, "default", "server/db/schama.js");
}();

;
//# sourceMappingURL=schama.js.map