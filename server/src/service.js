import serveFeed from "./serveFeed";
import source from "../../config/source.json";
import findRemoveSync from "find-remove";
import fs from "fs-extra";
import merge from "deepmerge";
import path from "path";
const rootPath = process.env.rootPath || path.join(__dirname, "..", "..");

const mergeEachSourceFile = sourceTitle => {
  Object.keys(source).map(function(sourceTitle) {
    // find store folder for each source feed
    let storeSource = path.join(rootPath, "store", sourceTitle);
    fs.readdir(storeSource, (err, res) => {
      var all = [];
      if (!err) {
        res.map(file => {
          if (file === "index.json") return;
          let getFile = JSON.parse(require(path.join(storeSource, file)));
          if (getFile || getFile !== "" || typeof getFile !== "undefined") {
            all.push(getFile);
          }
        });
        return fs.writeJson(
          path.join(storeSource, "index.json"),
          merge(...all),
          err => {
            if (err) return console.error(err);
            console.log("success!");
          }
        );
      }
    });
  });
};
const fetchUpdateAuto = async () => {
  let updateStore = {};
  try {
    return await Object.keys(source).reduce(function(promise, sourceTitle) {
      return promise.then(function() {
        return serveFeed(sourceTitle, true).then(function(res) {
          // save update object of each feed source so that it could be returned after loop
          updateStore[sourceTitle] = res;
          // now merge all timely json file which was saved at regular instance
          return updateStore;
        });
      });
    }, Promise.resolve());
  } catch (e) {
    console.log(e);
  }
};

const deleteOldSource = () => {
  let result = findRemoveSync(path.join(rootPath, "store"), {
    age: { seconds: 3600 * 12 }, // 12 hr
    maxLevel: 2,
    extensions: ".json"
  });
  console.log("Old json source file which were deleted : %s", result);
};

function AutoUpdateService(param) {
  let self = this;
  self.startTime = 0;
  self.minCount = 0;
  self.autoUpdateTime = Number.parseInt(param.autoUpdateTime);
  console.log(
    "Auto update service running with %s min update.",
    self.autoUpdateTime
  );
  setInterval(() => {
    // if its one min
    if (self.startTime === 1) {
      // start timer again
      self.startTime = 0;
      // if its five min then
      if (self.minCount === self.autoUpdateTime - 1) {
        // min count is o base so -1
        Promise.resolve(fetchUpdateAuto())
          .then(getAllUpdate => {
            self.lastUpdate = getAllUpdate;
          })
          .catch(e => console.log(e));
        // after fetching files delete json files which is older than 12 hrs
        deleteOldSource();
        mergeEachSourceFile();
        self.minCount = 0;
      } else {
        ++self.minCount;
      }
    }
    // after one min increase start time
    ++self.startTime;
  }, 60000);
}
export default AutoUpdateService;
