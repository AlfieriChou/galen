const readDirFilenames = require('read-dir-filenames')
const _ = require('lodash')
const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')

const buildCrudRemoteMethods = require('./lib/remoteMethods')

module.exports = async (modelDirPath) => {
  let remoteMethods = {}
  const modelSchemas = {}
  const schemas = {}

  const filepaths = readDirFilenames(modelDirPath)

  // eslint-disable-next-line array-callback-return
  await Promise.all(filepaths.map((filepath) => {
    if (!filepath.endsWith('.json') && !filepath.endsWith('.yaml')) {
      throw new Error('model supports json and yaml file')
    }
    let schema
    if (filepath.endsWith('.json')) {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      schema = require(filepath)
    }
    if (filepath.endsWith('.yaml')) {
      try {
        schema = yaml.safeLoad(fs.readFileSync(filepath, 'utf8'))
      } catch (err) {
        throw new Error(`${filepath.split('/').slice(-1)[0]} load yaml file error`)
      }
    }
    const filename = path.basename(filepath).replace(/\.\w+$/, '')
    if (!schema.modelName) {
      schema.modelName = _.upperFirst(filename)
    }
    if (!schema.tableName) {
      schema.tableName = _.snakeCase(filename)
    }
    // support virtual mysql
    if (!schema.dialect) {
      schema.dialect = 'mysql'
    }
    const { modelName, model } = schema
    const remoteMethod = buildCrudRemoteMethods(filename, schema)
    remoteMethods = {
      ...remoteMethods,
      ...Object.entries(remoteMethod).reduce((acc, [key, value]) => ({
        ...acc,
        [`${filename}-${key}`]: value
      }), {})
    }
    modelSchemas[modelName] = {
      model: {},
      ...schema
    }
    schemas[modelName] = {
      type: 'object', properties: model || {}
    }
  }))

  return {
    remoteMethods, modelSchemas, schemas
  }
}
