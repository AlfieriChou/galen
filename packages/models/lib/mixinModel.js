const readDirFilenames = require('read-dir-filenames')
const path = require('path')
const _ = require('lodash')

module.exports = async (dirPath, db) => {
  const filepaths = readDirFilenames(dirPath)

  const models = db

  await Promise.all(filepaths.map(async filepath => {
    if (!/^.*?\.(js)$/.test(filepath)) {
      throw new Error('load controller only support js file')
    }
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const buildModel = require(filepath)
    const filename = path.basename(filepath).replace(/\.\w+$/, '')
    const model = db[_.snakeCase(filename)] || class Model {}
    models[_.camelCase(filename)] = buildModel(model)
  }))

  return models
}
