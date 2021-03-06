/* eslint-disable no-console */

require("dotenv").config()

const Rx = require("rxjs")
const { map, mergeMap, toArray, tap, scan } = require("rxjs/operators")
const fs = require("fs")
const path = require("path")
const { unparse: jsonToCSV } = require("papaparse")

const parseStarHeader = require("./parse-star-header")

const LOG_NTH_LINE = 1000

const { SRC_DIRS, DST } = process.env

const dirs = SRC_DIRS.split(";")

const readDirAsObservable = Rx.bindNodeCallback(fs.readdir)
const readFileAsObservable = Rx.bindNodeCallback(fs.readFile)

console.log(`Processing STAR directories: ${dirs.join("; ")}`)

const loggingObserver = new Rx.Subject()
loggingObserver.pipe(scan(count => count + 1, 0)).subscribe({
  next: count => {
    if (count % LOG_NTH_LINE === 0) {
      console.log(`Processed ${count.toLocaleString("en-US")} files`)
    }
  },
})

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
      // @ts-ignore
      readFileAsObservable(
        path.join(fileObject.dirName, fileObject.fileName),
        "utf-8",
      ).pipe(
        map(content => parseStarHeader(content)),
        map(content => ({ ...fileObject, ...content })),
      ),
    ),
    tap(() => loggingObserver.next(1)),
    toArray(),
  )
  .subscribe(json => {
    console.log(`Lines: ${json.length}`)

    const csv = jsonToCSV(json)

    console.log(`Writing to ${DST}`)

    fs.writeFile(DST, csv, error => {
      if (error) {
        console.log(`Error: ${error}`)
      } else {
        console.log("Done")
      }
    })
  })
