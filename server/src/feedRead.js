import path from 'path'
import fs from 'fs'
import feedSource from './feedSource'
import collectFeed from './collectFeed'

const rootPath = process.env.rootPath || path.join(__dirname, '..', '..')

const saveFetchInfo = (data) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path.join(rootPath, 'store') + '/index.json', JSON.stringify(data), (e, r) => {
      if (e) reject(e)
      else resolve(true)
    })
  })
}
/**
 * It will fetch the feeds and parse it & save it as json
 * Souce can be user specific souce or all souce which saved by defualt
 * @param {object} source
 */
const getAndParse = (source = feedSource) => {
  let saveTime = {}
  let count = 1
  const totalSource = Object
    .keys(source)
    .length
  for (let title in source) {
    saveTime[title] = Date.now()
    collectFeed(title, source[title]).then((value) => {
      // if parsing and saving into json is successful then, value will true
      // to double check
      if (value) {
        // if its the last feed in loop then save the fetch time for source
        if (count === totalSource) {
          new Promise((resolve, reject) => {
            resolve(saveFetchInfo(saveTime))
          }).then((v) => {
            console.log('saveInfo has been written successfully')
          }).catch((e) => {
            console.error(e)
          })
        }
        count++
      }
    })
  }
}
getAndParse()
export default getAndParse
