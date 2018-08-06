const { promisify } = require("util")
const fs = require("fs")

const readDirPromise = promisify(fs.readdir)
const readFilePromise = promisify(fs.readFile)

module.exports = {
  readDirPromise,
  readFilePromise,
}
