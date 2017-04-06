import path from 'path'
import Feedparser from 'feedparser'
import fs from 'fs'
import through2 from 'through2'
import feedSource from './feedSource'
const rootPath = process.env.rootPath || path.join(__dirname, '..')

/**
 * This will exculde only the required information form stream source for each feed
 * and return a formated version of feed
 * @param {object} item
 * @returns object
 */
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
/**
 * This function will collect all feeds for each source then add the source
 * as id and add fetch time
 * @param {any} source string
 * @param {any} items object
 * @returns object
 */
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

/**
 * This will collect all single feeds and push it in one array
 * @param {any} fn
 * @returns object
 */
const collectFeed = function (fn) {
  var self = this
  return fn.on('data', function (data) {
    self
      .allFeeds
      .push(data)
  })
}

/**
 * It will get the all the feeds from any single source of feed and save it
 * as a json file after stream is finish
 * @param {function} fn
 * @returns stream
 */
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

/**
 * This function construct the base of feed parser
 * It collects all independen function and glue it together for use in feedparser
 */
const SetParser = function () {
  this.collectFeed = collectFeed
  this.saveJson = saveJson
  this.pipeFeed = pipeFeed
  this.collectItem = collectItem
  this.formatItem = formatItem
  this.allFeeds = []
}

/**
 * This is main function which will instantiate the SetParser
 * Also it will return the make every function work to done the work
 * @param {string} feedTitle - Title of the souce
 * @param {string} feedUrl - Url of the sources
 * @returns
 */
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

/**
* It will read the source file object
* Then will parse each sources using function feedParser
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

export default feedParser
