import fs from "fs-extra";
import path from "path";
import through2 from "through2";
import Feedparser from "feedparser";
import { _fetch } from "./util";
import config from "../../config/config.json";
import source from "../../config/source.json";
const rootPath = process.env.rootPath || path.join(__dirname, "..", "..");
var Promise = require("bluebird");

/**
 * This function scrap details text of each news feed while autoupdating
 * Scarping is done by a custom node modules by cherrioreq.
 * @param {string} itemUrl - Url of the news sources for specific news feed
 * @param {any} scrapeIdentity - The tag contains the details of the new we interested.
 * @returns promise
 */
const scrapDescription = (itemUrl, scrapeIdentity) => {
  const cheerioReq = require("cheerio-req");
  return new Promise(resolve => {
    cheerioReq(itemUrl, (err, $) => {
      var totalNews = "";
      if (err) console.log(err);
      let $links = $(scrapeIdentity);
      for (let i = 0; i < $links.length; ++i) {
        totalNews += "<p>" + $links.eq(i).text() + "</p>";
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

const CollectFeed = function(sourceTitle, sourceUrl, lastFirstFeedTitle) {
  this.sourceUrl = sourceUrl;
  this.sourceTitle = sourceTitle;
  this.scrapTag = source[sourceTitle].scrapeIdentity;
  this.feedCollection = [];
  this.fetch = _fetch;
  this.writeFile = (fileName, fileToWrite) => {
    try {
      if (typeof fileToWrite !== "undefined") {
        fs.writeJson(
          path.join(rootPath, "store", this.sourceTitle, fileName + ".json"),
          fileToWrite
        );
        console.log("Feed parsed from %s", this.sourceTitle);
      }
    } catch (e) {
      console.log(e);
    }
  };
  this.processWrite = (fileName, dataToWrite) => {
    console.log(" writing process of %s started.", sourceTitle);
    let self = this;
    let fileFolder = path.join(rootPath, "store", this.sourceTitle);
    fs.ensureDir(fileFolder, e => {
      self.writeFile(fileName, dataToWrite);
    });
  };
  var self = this;
  this.formatXml = Response => {
    if (!Response) return { isUpdateAvailable: false };
    console.log("formatting xml of %s started.", sourceTitle);
    return new Promise((resolve, reject) => {
      var feedCollection = {};
      return Response.pipe(new Feedparser())
        .pipe(
          through2.obj(function(chunk, enc, callback) {
            // here it will cross check with old feed first item with newly chunked from stream
            // if old feed first item title is equal with new first source item then we will cancel
            // fetching as there is nothing new to update
            if (chunk.title === lastFirstFeedTitle) {
              return resolve({ isUpdateAvailable: false });
            }
            // if new items available then process will be continued
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
          feedCollection[data.title] = data;
        })
        .on("end", () => {
          var timeNow = Date.now(); // this time will use as a refrence into file name

          this.processWrite(timeNow, feedCollection);
          resolve({
            feedsLength: Object.keys(feedCollection).length,
            fileName: timeNow + ".json",
            feeds: feedCollection,
            isUpdateAvailable: true
          });
        });
    });
  };

  this.initCollect = async function() {
    try {
      let getXml = await self.fetch(sourceUrl);
      let processXml = await self.formatXml(getXml.body);
      return processXml;
    } catch (error) {
      throw Error(error);
    }
  };
};
/*
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
    */

export default CollectFeed;
