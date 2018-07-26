const { promisify } = require("util")
const fs = require("fs")

const readDir = promisify(fs.readdir)

module.exports = path => readDir(path)
