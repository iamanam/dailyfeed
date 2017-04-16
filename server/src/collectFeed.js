import fs from "fs";
import path from "path";
import through2 from "through2";
import Feedparser from "feedparser";
import htmlToText from "html-to-text";
import { _fetch } from "./util";

const rootPath = process.env.rootPath || path.join(__dirname, "..", "..");

/**
 * This will exculde only the required information form stream source for each feed
 * and return a formated version of feed
 * @param {object} item
 * @returns object
 */
const formatItem = function(item) {
  if (item && typeof item === "object") {
    // finding an image from feed is bit of problem, so needed to go through some
    // extra mechanism
    let img = item["rss:image"];
    if (img) {
      var tag = img["#"] === undefined
        ? img["url"] ? img["url"]["#"] : "none"
        : img["#"];
    }
    return {
      title: item.title,
      description: htmlToText.fromString(
        item.description ||
          item["content:encoded"][1] ||
          "no description available",
        {
          hideLinkHrefIfSameAsText: true,
          ignoreHref: true,
          ignoreImage: true
        }
      ),
      pubDate: item.pubDate,
      image: tag,
      link: item.link
    };
  }
  throw Error("item feeds cant be formatted");
};

const CollectFeed = function(sourceTitle, sourceUrl) {
  this.sourceUrl = sourceUrl;
  this.sourceTitle = sourceTitle;
  this.feedCollection = [];
  this.fetch = _fetch;
  this.arrangeCollection = feedCollection => {
    return JSON.stringify(Object.assign({}, { items: feedCollection }));
  };
  this.writeFile = fileToWrite => {
    fs.writeFile(
      path.join(rootPath, "store", this.sourceTitle + ".json"),
      fileToWrite,
      e => {
        if (e) {
          throw Error(e);
        }
        // save meta info after successful writing
        console.log("Feed parsed from %s", this.sourceTitle);
      }
    );
  };
  this.formatXml = Response => {
    return new Promise((resolve, reject) => {
      var feedCollection = [];
      return Response.pipe(new Feedparser())
        .pipe(
          through2.obj(function(chunk, enc, callback) {
            this.push(formatItem(chunk));
            callback();
          })
        )
        .on("error", e => {
          throw Error(e);
        })
        .on("data", data => {
          feedCollection.push(data);
        })
        .on("end", () => {
          this.writeFile(this.arrangeCollection(feedCollection));
          resolve(this.arrangeCollection(feedCollection));
        });
    });
  };
  var self = this;
  return new Promise((resolve, reject) => {
    self.fetch(sourceUrl).then(response => {
      if (response.status === 200) {
        return resolve(response.body);
      }
      reject(response.status);
    });
  }).then(response => {
    return Promise.resolve(self.formatXml(response));
  });
};

export default CollectFeed;
