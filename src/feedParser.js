import path from 'path'
import Feedparser from 'feedparser'
import fs from 'fs'
import through2 from 'through2'
import feedSource from './feedSource'
const rootPath = process.env.rootPath || path.join(__dirname, '..')

// format data for each single feed
const formatItem = function (item) {
  if (item && typeof item === 'object') {
    return {
      title: item.title,
      description: item.description || item['content:encoded'][1] || 'no description available',
      pubDate: item.pubDate,
      image: item.image
    }
  }
  console.log('item feeds cant be formatted')
}
const collectItem = function (source, items) {
  return {
    id: source,
    fetchTime: Date.now(),
    items: items
  }
}
const pipeFeed = function (fn) {
  var self = this
  return fn
    .pipe(new Feedparser())
    .pipe(through2.obj(function (chunk, enc, callback) {
      // console.log(chunk.title)
      this.push(self.formatItem(chunk))
      callback()
    }))
}

const collectFeed = function (fn) {
  var self = this
  return fn.on('data', function (data) {
    self
      .allFeeds
      .push(data)
  })
}
const saveJson = function (fn) {
  var self = this
  return fn.on('end', function () {
    let store = JSON.stringify(self.collectItem(self.feedTitle, self.allFeeds))
    if (store && typeof store === 'string') {
      fs.writeFile(path.join(rootPath, 'store', self.feedTitle + '.json'), store, (e) => {
        if (e) {
          throw e
        }
      }
      )
    } else {
      throw Error("Store is undefined or null, Feed couldn't be read & parsed.")
    }
  })
}
const SetParser = function () {
  this.collectFeed = collectFeed
  this.saveJson = saveJson
  this.pipeFeed = pipeFeed
  this.collectItem = collectItem
  this.formatItem = formatItem
  this.allFeeds = []
}
const feedParser = (feedTitle, feedUrl) => {
  let parser = new SetParser()
  parser.feedTitle = feedTitle
  parser.feedUrl = feedUrl
  return parser.saveJson(parser.collectFeed(parser.pipeFeed(fs.createReadStream(feedUrl))))
}
/*
const readFeed = (feedTitle, feedUrl, FeedParser) => {
    let allFeeds = []

    fs
        .createReadStream(feedUrl)
        .pipe(new Feedparser())
        .pipe(through2.obj(function (chunk, enc, callback) {
            //console.log(chunk.title)
            this.push(formatItem(chunk))
            callback()
        }))
        .on('data', function (data) {
            allFeeds.push(data)
        })
        .on('end', function () {
            let store = JSON.stringify(collectItem(feedTitle, allFeeds))
            if (store && typeof store === 'object') {
                fs.writeFile(path.join(rootPath, "store", feedTitle + ".json"), store, (e) => {
                    if (e)
                        throw e
                    }
                )
            } else {
                throw error("Store is undefined or null, Feed couldn't be read & parsed.")
            }
        })
}
*/
export const parseAll = () => {
  for (let key in feedSource) {
    let file = path.join(rootPath, 'feeds', key + '.xml')
    fs.stat(file, (e, s) => {
      if (!e) {
        return feedParser(key, file)
      } else {
        console.error(e)
      }
    }
    )
  }
}
parseAll()
export default feedParser
