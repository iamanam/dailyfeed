let feeds = require('../../feedSource.json')
let newFeed = require('../../feedNew.json')
var y = Object.assign(feeds, newFeed)
export default y

/*
const feedSource = {
  'bd-new24': {
    'feedUrl': 'http://bangla.bdnews24.com/?widgetName=rssfeed&widgetId=1151&getXmlFeed=true',
    'feedLength': 10,
    'lastfetch': ''
  },
  'prothom-alo': {
    'feedUrl': 'http://www.prothom-alo.com/feed/',
    'feedLength': 10,
    'lastfetch': ''
  }
}
*/
