const { promisify } = require("util")
const fs = require("fs")

const readDirPromise = promisify(fs.readdir)

module.exports = {
  readDirPromise,
}
