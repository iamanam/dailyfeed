import { dyn, docClient } from "./initDb";
import { query, deletTable, putItem, getItem } from "./helper";
import createTable, { FeedSourceInfo } from "./table";
import { feedSourceSchama, feedSourceInfoSchama } from "./schama";

//console.log(update);
//createTable(dyn, FeedSourceInfo);
/*
putItem(
  docClient,
  "FeedSource",
  feedSourceSchama(
    "bdnews24",
    "http://bangla.bdnews24.com/?widgetName=rssfeed&widgetId=1151&getXmlFeed=true",
    "div.custombody>p"
  )
);

putItem(docClient, "FeedSourceInfo", feedSourceInfoSchama("bdnews24", 20));
*/
// console.log(dyn.listTables(t => console.log(t)));
// put(null, dyn);

getItem(docClient, "FeedSource", { sourceTitle: "prothom-alo" });

/*
const userData = query(docClient, "FeedSource", "sourceTitle", {
  ":sourceTitle": "bdnews24"
});
userData.then(v => {
  v["Items"].forEach(function(data) {
    console.log(data);
  }, this);
});
*/
