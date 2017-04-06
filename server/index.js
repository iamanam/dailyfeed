const path = require('path')
const express = require('express')
const app = express()
const reload = require('reload')

// var router = express.Router()
// const path = require("path")
const rootPath = process.env.rootPath

// setting files of static to server easily
app.use(express.static(path.join(rootPath, 'client')))
app.use(express.static(path.join(rootPath, 'server')))

// -------------import routing
// Include server routes as a middleware
app.get('/', function (req, res, next) {
  res.sendFile('./index.html', {root: rootPath})
})
var server = require('http').createServer(app)

if (process.env.isDevelopment) {
  reload(server, app)
  require(path.join(path.join(rootPath, './dev-server')))(app)
}

app.set('port', process.env.PORT || 3000)
app.set('host', process.env.HOST || 'localhost')

server.listen(3000, function () {
  console.log('%s server listening at http://%s:%s', process.env.env, app.get('host'), app.get('port'))
})
