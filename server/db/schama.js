/**
 * Schama to save feedSource
 * @param {any} sourceTitle 
 * @param {any} sourceUrl 
 * @param {any} feedItem 
 * @param {any} scrapeIdentity 
 * @returns 
 */

export const feedSourceSchama = (sourceTitle, sourceUrl, scrapeIdentity) => {
  return {
    sources: {
      sourceTitle: sourceTitle,
      sourceUrl: sourceUrl,
      scrapeIdentity: scrapeIdentity
    }
  };
};

export const feedSourceInfoSchama = (sourceTitle, feedItem) => {
  return {
    sourceTitle: sourceTitle,
    lastFetched: Date.now(),
    feedItem: feedItem || "0"
  };
};

export const feedSourceSchamaKeys = () => {
  return Object.keys(feedSourceSchama);
};

export default feedSourceSchama;
