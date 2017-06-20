import { dyn } from "../db/initDb";
import { feedStore } from "../db/table.js";
const fs = require("fs-extra");
const path = require("path");

const source = process.env.NODE_ENV === "development"
  ? require("../../config/source.json")
  : require("../../config/source_pro.json");

function processTable() {
  dyn.listTables((e, list) => {
    if (e) return console.log(e);
    Object.keys(source).map(item => {
      let date = new Date(new Date().getTime() + 1000 * 60 * 60 * 24).getDate();
      let prevDate = new Date(
        new Date().getTime() - 1000 * 60 * 60 * 48
      ).getDate();
      let table = item + "_" + date;
      let prevTable = item + "_" + prevDate;
      if (!list["TableNames"].includes(table)) {
        dyn.createTable(feedStore(table), (e, r) => {
          if (e) {
            console.log(e);
          }
          if (r["TableDescription"]["TableStatus"] === "ACTIVE") {
            console.log("table created for %s", table);
          }
        });
      }

      if (list["TableNames"].includes(prevTable)) {
        return dyn.deleteTable(
          {
            TableName: prevTable
          },
          (e, r) => {
            if (e) return console.log(e);
            console.log("table successfully deleted =>%s", prevTable);
          }
        );
      }
    });
  });
}

function deleteOldJson() {
  let folderPath = path.join(__dirname, "workstore");
  fs.readdir(folderPath, (e, f) => {
    if (e) return;
    f.forEach(name => {
      fs.readdir(path.join(folderPath, name), (e, f) => {
        f.pop();
        if (e) return console.log(e);
        f.forEach(file => {
          if (file === "info.json") return;
          let fileDate = parseInt(file.split("_")[0]);
          let today = new Date().getTime();
          let yesterDay = new Date(today - 1000 * 60 * 60 * 24).getDate();
          if (fileDate === yesterDay) {
            let absoulatePath = path.join(folderPath, name, file);
            fs.removeSync(absoulatePath);
          }
        });
      });
    });
  });
}

processTable();
setInterval(() => {
  processTable();
  deleteOldJson();
}, 1000 * 60 * 60 * 24);
