const readDirFilenames = require('read-dir-filenames')
const path = require('path')
const fs = require('fs')
const _ = require('lodash')

module.exports = async (dirPath, db) => {
  if (!fs.existsSync(dirPath)) {
    return db
  }
  const filepaths = readDirFilenames(dirPath)

  const models = db

  await Promise.all(filepaths.map(async filepath => {
    if (!/^.*?\.(js)$/.test(filepath)) {
      throw new Error('load controller only support js file')
    }
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const buildModel = require(filepath)
    const filename = path.basename(filepath).replace(/\.\w+$/, '')
    const modelName = _.upperFirst(filename)
    const model = db[modelName] || class Model {}
    models[modelName] = buildModel(model)
  }))

  return models
}
