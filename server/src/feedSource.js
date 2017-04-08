import path from 'path'
var p = path.join(__dirname, '..', '..', 'store')

const eedSource = {
  'prothom-alo': 'http://www.prothom-alo.com/feed/',
  'bd-new24': 'http://bangla.bdnews24.com/?widgetName=rssfeed&widgetId=1151&getXmlFeed=true'
}
const feedSource = {
  'prothom-alo': path.join(p, '/prothom-alo.xml'),
  'bd-new24': path.join(p, 'bd-new24.xml')
}

export default feedSource
