import fs from "fs";
import path from "path";
import through2 from "through2";
import Feedparser from "feedparser";
import { _fetch } from "./util";
import { getSource } from "../../store/index";
import config from "../../config/config.json";
const rootPath = process.env.rootPath || path.join(__dirname, "..", "..");

const scrapDescription = (itemUrl, scrapeIdentity) => {
  const cheerioReq = require("cheerio-req");
  return new Promise(resolve => {
    cheerioReq(itemUrl, (err, $) => {
      var totalNews = [];
      if (err) console.log(err);
      let $links = $(scrapeIdentity);
      for (let i = 0; i < $links.length; ++i) {
        totalNews.push($links.eq(i).text());
      }
      resolve(totalNews);
    });
  });
};

const altDes = item => {
  const htmlToText = require("html-to-text");
  return htmlToText.fromString(
    item.description ||
      item["content:encoded"][1] ||
      "no description available",
    {
      hideLinkHrefIfSameAsText: true,
      ignoreHref: true,
      ignoreImage: true
    }
  );
};
/**
 * This will exculde only the required information form stream source for each feed
 * and return a formated version of feed
 * @param {object} item
 * @returns object
 */
const formatItem = async function(item, scrapeIdentity) {
  if (item && typeof item === "object") {
    let descriptin;
    if (config.local.newsSetting.scrapping) {
      descriptin = await scrapDescription(item.link, scrapeIdentity); // this is the main description fetched from main site
    } else descriptin = altDes(item); // this is the short descriptin comes from feed after normalize html signs

    // finding an image from feed is bit of problem, so needed to go through some
    // extra mechanism
    let img = item["rss:image"];
    if (img) {
      var tag = img["#"] === undefined
        ? img["url"] ? img["url"]["#"] : "none"
        : img["#"];
    }

    let result = await {
      title: item.title,
      description: descriptin,
      pubDate: item.pubDate,
      image: tag,
      link: item.link
    };
    return result;
  }
  throw Error("item feeds cant be formatted");
};

const CollectFeed = function(sourceTitle, sourceUrl) {
  this.sourceUrl = sourceUrl;
  this.sourceTitle = sourceTitle;
  this.scrapTag = getSource(sourceTitle).jsonFile;
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
  var self = this;
  this.formatXml = Response => {
    return new Promise((resolve, reject) => {
      var feedCollection = [];
      return Response.pipe(new Feedparser())
        .pipe(
          through2.obj(function(chunk, enc, callback) {
            new Promise((resolve, reject) => {
              resolve(formatItem(chunk, self.scrapTag));
            }).then(v => {
              this.push(v);
              callback();
            });
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
