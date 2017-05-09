var AWS = require("aws-sdk");
var fs = require("fs");
var s3 = new AWS.S3({
  signatureVersion: "v4",
  region: "ap-south-1"
});
function getContentTypeByFile(fileName) {
  var rc = "application/octet-stream";
  var fn = fileName.toLowerCase();

  if (fn.indexOf(".html") >= 0) rc = "text/html";
  else if (fn.indexOf(".css") >= 0) rc = "text/css";
  else if (fn.indexOf(".json") >= 0) rc = "application/json";
  else if (fn.indexOf(".js") >= 0) rc = "application/x-javascript";
  else if (fn.indexOf(".png") >= 0) rc = "image/png";
  else if (fn.indexOf(".jpg") >= 0) rc = "image/jpg";
  return rc;
}

export default function uploadFile(
  remoteFilename,
  // fileName,
  fileBuffer,
  ContentType
) {
  // var fileBuffer = fs.readFileSync(fileName);
  // var metaData = getContentTypeByFile(fileName);
  console.log("file upload to s3 started");

  s3.putObject(
    {
      ACL: "public-read",
      Bucket: "feedstorebd",
      Key: remoteFilename,
      Body: fileBuffer,
      ContentType: ContentType // metadata in case of file
    },
    function(error, response) {
      console.log(
        "uploaded buffer to [" + remoteFilename + "] as [" + ContentType + "]"
      );
      console.log(arguments);
    }
  );
}

function uploadFolder(folderName) {
  var CODE_PATH = "base-folder";
  var fileList = getFileList("./" + CODE_PATH + folderName + "/");

  fileList.forEach(function(entry) {
    uploadFile(
      CODE_PATH + folderName + "/" + entry,
      "./" + CODE_PATH + folderName + "/" + entry
    );
  });
}

function getFileList(path) {
  var i, fileInfo, filesFound;
  var fileList = [];

  filesFound = fs.readdirSync(path);
  for (i = 0; i < filesFound.length; i++) {
    fileInfo = fs.lstatSync(path + filesFound[i]);
    if (fileInfo.isFile()) fileList.push(filesFound[i]);
  }
  return fileList;
}
