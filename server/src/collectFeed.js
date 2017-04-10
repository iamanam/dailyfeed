import fs from 'fs'
import path from 'path'
import fetch from 'isomorphic-fetch'
import through2 from 'through2'
import Feedparser from 'feedparser'
var htmlToText = require('html-to-text')

require('es6-promise').polyfill()
const rootPath = process.env.rootPath || path.join(__dirname, '..', '..')

/**
 * This function will use only on testing local version of xml
 * @param {any} sourceUrl
 * @returns promise
 */
const req = (sourceUrl) => {
  // console.log(sourceUrl)
  /*
  return new Promise((resolve, reject) => {
    let stream = fs.createReadStream(sourceUrl)

    return stream
  }).then(v => {
    return v
  })
  */
  let stream = fs.createReadStream(sourceUrl)

  stream.on('error', (e) => {
    throw Error("file couldn't be fetched. Reason \n" + e)
  })
  return stream
}

/**
 * This function will fetch xml source from source url with the help of isomorphic-fetch
 * @param {string} sourceUrl
 * @returns stream
 */
const fetchXml = (sourceUrl) => {
  return fetch(sourceUrl).then((res, err) => {
    if (res.status !== 200) {
      throw Error('failed to fetch ' + res.status)
    }
    return res.body
  }).catch((e) => {
    console.log(e)
  })
}

/**
 * This will exculde only the required information form stream source for each feed
 * and return a formated version of feed
 * @param {object} item
 * @returns object
 */
const formatItem = function (item) {
  if (item && typeof item === 'object') {
    // finding an image from feed is bit of problem, so needed to go through some
    // extra mechanism
    let img = item['rss:image']
    if (img) {
      var tag = img['#'] === undefined
        ? (img['url']
          ? img['url']['#']
          : 'none')
        : img['#']
    }
    return {
      title: item.title,
      description: htmlToText.fromString(item.description || item['content:encoded'][1] || 'no description available', {
        hideLinkHrefIfSameAsText: true,
        ignoreHref: true,
        ignoreImage: true
      }),
      pubDate: item.pubDate,
      image: tag,
      link: item.link
    }
  }
  throw Error('item feeds cant be formatted')
}

/**
 * This function save xml source after fetched by fetchXml
 * @param {string} sourceTitle
 * @param {string} sourceUrl
 * @param {function} fetchXml
 */
const xmlToJson = (sourceTitle, sourceUrl, fetchXml) => {
  let allFeeds = []
  try {
    // attaching a promise to get the operation result
    return new Promise((resolve, reject) => {
      // might need to use then after calling fetchxml
      return fetchXml(sourceUrl).then((Response) => {
        Response
          .pipe(new Feedparser())
          .pipe(through2.obj(function (chunk, enc, callback) {
            this.push(formatItem(chunk))
            callback()
          }))
          .on('error', (e) => {
            console.error("through2 piping couldn't finish")
            reject(e)
          })
          .on('data', (data) => {
            allFeeds.push(data)
          })
          .on('end', () => {
            var jsonFormat = JSON.stringify({
              time: Date.now(),
              id: sourceTitle,
              items: allFeeds
            })
            fs.writeFile(path.join(rootPath, 'store', sourceTitle + '.json'), jsonFormat, (e) => {
              if (e)
                return reject(e)
              console.log('Feed parsed from %s', sourceTitle)
              return resolve(true)
            })
          })
      })
    }) // promise end
  } catch (e) {
    throw Error('Error in xmlToJson fn. \n ' + e)
  }
}

/**
 * This function fetch xml feeds by using isomorphic-fetch
 * Then save it in store/xml dir to be parsed by feedParser
 * @param {string} sourceTitle title for feed source
 * @param {string} sourceUrl  url for feed source
 */
var collectFeed = (sourceTitle, sourceUrl) => {
  if (typeof sourceTitle === 'string' && typeof sourceUrl === 'string' && typeof fetchXml === 'function') {
    /*
        return new Promise((resolve, reject) => {
          let save = xmlToJson(sourceTitle, sourceUrl, fetchXml)
          console.log(save)
          resolve(save)
        }).catch((e) => {
          console.log(e)
        })*/
    return xmlToJson(sourceTitle, sourceUrl, fetchXml)
  }
  throw new Error("Function parameter doesn't match with type its required")
}

export default collectFeed
