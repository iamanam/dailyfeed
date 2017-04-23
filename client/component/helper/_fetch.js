import fetchIso from "isomorphic-fetch";
var _fetch = {
  /**
  * This function will fetch feed from different source depends on request
  * By default it will serve from local saved json file
  * Or it will serve from cached or in case of update it will route to server route and
  * collect latest json, save it in disk and will serve feeds from buffer
  * @param {String} fetchInfo Information of fetch source and fetch type
  * @returns json object
  * @memberOf FeedContainer
  */
  fetchType(sourceTitle, isUpdate) {
    if (this.cachedFeed[sourceTitle] && !isUpdate) {
      let feedCache = this.cachedFeed[sourceTitle];
      // if feeds are in cache and update feed not requested
      this.setState({ feeds: feedCache, totalItems: feedCache.items.length }); // as this is served from cache need to reset state
      return this.cachedFeed[sourceTitle];
    } /*else if (isUpdate) {
      // if update requested then splitfetch info should be update
      let serveFreshJsonUrl = "serveJson/" + sourceTitle + "/update"; // set the server route url ready /servejson/title/update
      return this.fetch(serveFreshJsonUrl);
    }*/
    return this.fetch(sourceTitle + "/index" + ".json"); // search from local source by defualt
  },

  /**
   * This will only fetch depending on fetchtype url
   * @param {String} fetchUrl
   * @returns object
   * @memberOf FeedContainer
   */
  fetch(fetchUrl) {
    //console.log(fetchUrl);
    let self = this;
    try {
      // if contents are not cached then fetch and cache it
      return new Promise((resolve, reject) => {
        fetchIso(fetchUrl).then(response => {
          if (response.status >= 400) {
            return reject(response);
          }
          resolve(response.json());
        });
      }).then(feeds => {
        self.setState({ feeds: feeds, totalItems: feeds.items.length }); // as this is served from cache need to reset state
        // save this for caching purpose
        self.cachedFeed[fetchUrl] = feeds;
      });
    } catch (e) {
      throw Error(e);
    }
  }
};
export default _fetch;
