"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.feedSourceSchamaKeys = exports.feedSourceInfoSchama = exports.feedSourceSchama = undefined;

var _keys = require("babel-runtime/core-js/object/keys");

var _keys2 = _interopRequireDefault(_keys);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
  return (0, _keys2.default)(feedSourceSchama);
};

exports.default = feedSourceSchama;
//# sourceMappingURL=schama.js.map