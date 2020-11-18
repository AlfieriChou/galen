const path = require('path')
const readDirFilenames = require('read-dir-filenames')
const isClass = require('is-class')

module.exports = (dirPath, options) => {
  const dirFiles = readDirFilenames(dirPath, options)
  return dirFiles.reduce((ret, dirFile) => {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const classes = require(dirFile)
    if (!isClass(classes)) {
      throw new Error('exports must be a class')
    }
    return {
      ...ret,
      // eslint-disable-next-line import/no-dynamic-require, global-require
      [path.basename(dirFile).replace(/\.\w+$/, '')]: classes.prototype
    }
  }, {})
}
