/* eslint-disable no-console */

require("dotenv").config()

const Rx = require("rxjs")
const { map, mergeMap } = require("rxjs/operators")
const fs = require("fs")
const path = require("path")

const parseStarHeader = require("./parse-star-header")

const { SRC_DIRS } = process.env

const dirs = SRC_DIRS.split(";")

const readDirAsObservable = Rx.bindNodeCallback(fs.readdir)
const readFileAsObservable = Rx.bindNodeCallback(fs.readFile)

Rx.from(dirs)
  .pipe(
    mergeMap(dirName =>
      readDirAsObservable(dirName).pipe(
        map(fileNames =>
          fileNames.map(fileName => ({
            dirName,
            fileName,
          })),
        ),
      ),
    ),
    mergeMap(fileObjects =>
      fileObjects.reduce((acc, fileObject) => acc.concat(fileObject), []),
    ),
    mergeMap(fileObject =>
      readFileAsObservable(
        path.join(fileObject.dirName, fileObject.fileName),
        "utf-8",
      ).pipe(
        map(content => parseStarHeader(content)),
        map(content => ({ ...fileObject, ...content })),
      ),
    ),
  )
  .subscribe(console.log)
