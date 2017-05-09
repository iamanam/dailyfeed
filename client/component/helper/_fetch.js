import fetchIso from "isomorphic-fetch";
var Promise = require("bluebird");
console.log(process.env);
const coludFrontUrl = "http://dqf1m5iv0fm88.cloudfront.net";
var _fetch = {
  /**
  * This function will fetch feed from different source depends on request
  * By default it will serve from local saved json file
  * Or it will serve from cached or in case of update it will route to server route and
  * collect latest json, save it in disk and will serve feeds from buffer
  * @param {String} fetchInfo Information of fetch source and fetch type
  * @returns json object
  * @memberOf _fetch.js
  */
  fetchType(sourceTitle, isUpdate) {
    if (isUpdate) {
      // if update requested then splitfetch info should be update
      let serveFreshJsonUrl = "latest/" + sourceTitle; // set the server route url ready /servejson/title/update
      return this.fetch(sourceTitle, serveFreshJsonUrl, isUpdate);
    } else {
      if (this.cachedFeed[sourceTitle])
        return this.setState({ feeds: this.cachedFeed[sourceTitle] });
      // else return this.fetch(sourceTitle, sourceTitle + "/index" + ".json"); // search from local source by defualt

      return this.fetch(
        sourceTitle,
        coludFrontUrl + "/" + sourceTitle + ".json"
      );
    }
  },

  /**
   * This will only fetch depending on fetchtype url
   * @param {String} fetchUrl
   * @returns object
   * @memberOf _fetch.js
   */
  fetch(sourceTitle, fetchUrl, isUpdate) {
    let self = this;
    try {
      // if contents are not cached then fetch and cache it
      return new Promise((resolve, reject) => {
        fetchIso(fetchUrl)
          .catch(e => {
            throw Error("error at fetching in fetch.js lin 43");
          })
          .then(response => {
            if (response.status >= 400) {
              return reject(response);
            }
            resolve(response.json());
          });
      }).then(feeds => {
        if (isUpdate) return self.setState({ feeds: feeds["items"] });
        self.setState({ feeds: feeds });
      });
    } catch (e) {
      throw Error(e);
    }
  }
};
export default _fetch;

/*
       console.log(feeds["feeds"]);
        //let mergeFeedsWithOld = Object.assign({}, self.state.feeds, feeds);
        //console.log(mergeFeedsWithOld);
        self.setState({
          feeds: feeds["feeds"],
          totalItems: feeds.feedsLength
        }); // as this is served from cache need to reset state
        // save this for caching purpose
        //self.cachedFeed[sourceTitle] = mergeFeedsWithOld;
        */
