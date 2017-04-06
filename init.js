require('babel-core/register')
const path = require('path')
process.env.rootPath = path.join(__dirname)
if (process.argv.pop() === 'dev' || '--dev') {
  process.env.env = 'dev'
  process.env.isDevelopment = true
}
require('./server/index.js')
