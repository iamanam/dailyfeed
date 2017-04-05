import fs from 'fs';
import path from 'path';
import feedUrl from "./feedSource";
require('es6-promise').polyfill();
require('isomorphic-fetch');
const rootPath = process.env.rootPath;
const feedDir = path.join(rootPath, 'feeds/');

var getFeed = url => {
  var saveStream = fs.createWriteStream(feedDir + source + '.xml', 'utf8', {autoClose: true});

  fetch(url).then(res => {
    if (res.status != '200') 
      console.log('failed to fetch');
    else 
      return res.body;
    }
  ).then(body => {
    body.pipe(saveStream);
    body.on('error', err => {
      console.log(err);
      saveStream.end();
    });
  });
  saveStream.on("start", () => console.log('Fetch started -> ' + url))
  saveStream.on('error', e => {
    console.log(e);
    saveStream.end();
  });
  saveStream.on("finish", (e) => {
    console.log('stream finished -> ' + url);
    saveStream.end();
  })
};

for (var source in feedUrl) {
  let url = feedUrl[source];
  console.log(feedDir, url, source);
  getFeed(url);
}

export default getFeed;