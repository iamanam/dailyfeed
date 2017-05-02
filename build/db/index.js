"use strict";

var _initDb = require("./initDb");

var _helper = require("./helper");

var _table = require("./table");

var _table2 = _interopRequireDefault(_table);

var _schama = require("./schama");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

(0, _helper.getItem)("FeedSourceInfo", { sourceTitle: "prothom-alo" });

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

;

var _temp = function () {
  if (typeof __REACT_HOT_LOADER__ === 'undefined') {
    return;
  }
}();

;
//# sourceMappingURL=index.js.map