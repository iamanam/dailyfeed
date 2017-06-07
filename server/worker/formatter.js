var omitEmpty = require("omit-empty");
const config = process.env.NODE_ENV === "development"
  ? require("../../config/config.json")
  : require("../../config/config_production.json");

const source = process.env.NODE_ENV === "production"
  ? require("../../config/source_pro.json")
  : require("../../config/source.json");

function scrapDescription(itemUrl, scrapeIdentity) {
  const cheerioReq = require("cheerio-req");
  return new Promise(resolve => {
    cheerioReq(itemUrl, (err, $) => {
      var totalNews = "";
      if (err) console.log(err);
      let $links = $(scrapeIdentity);
      for (let i = 0; i < $links.length; ++i) {
        let text = $links.eq(i).text().replace(/\s+/g, " ");
        if (scrapeIdentity === "div#myText") {
          let s = text.indexOf("var");
          let f = text.indexOf("});") + 3;
          text = text.replace(text.slice(s, f), "");
        }
        if (text.length >= 5 && typeof text === "string") {
          totalNews += "<p>" + text + "</p>";
        }
      }
      resolve(totalNews);
    });
  });
}
export default async function formatItem(item, feedSource) {
  try {
    if (item && typeof item === "object" && feedSource) {
      let scrapeIdentity = source[feedSource]["scrapeIdentity"];
      let description;
      if (config.local.newsSetting.scrapping) {
        description = await scrapDescription(item.link, scrapeIdentity); // this is the main description fetched from main site
      } else description = altDes(item); // this is the short descriptin comes from feed after normalize html signs

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
        description: description,
        publish: new Date(item.pubDate).getTime(),
        image: tag,
        link: item.link,
        dayToday: new Date().getDate()
      };
      return omitEmpty(result);
    }
    throw Error("item feeds cant be formatted");
  } catch (e) {
    console.log(e);
  }
}
function altDes(item) {
  const htmlToText = require("html-to-text");
  try {
    let description =
      item.description ||
      item["rss:description"]["#"] ||
      item["content:encoded"][1] ||
      "no description available";
    // return description after stripping html
    if (description) {
      return htmlToText.fromString(description, {
        hideLinkHrefIfSameAsText: true,
        ignoreHref: true,
        ignoreImage: true
      });
    }
    return console.log("description couldn't be fetched.");
  } catch (e) {
    console.log(e);
  }
}
