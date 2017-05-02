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

exports.default = feedSourceSchama;
//# sourceMappingURL=schama.js.map