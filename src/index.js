require("dotenv").config()

const listDirContentPromise = require("./list-dir-content-promise")

/* eslint-disable no-console */

listDirContentPromise(process.env.SRC_DIR).then(files => {
  console.log(files)
})
