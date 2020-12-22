const readDirFilenames = require('read-dir-filenames')
const _ = require('lodash')
const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')

const buildCrudRemoteMethods = require('./lib/remoteMethods')

const buildModels = async (modelDirPath) => {
  const modelSchemas = {}
  const schemas = {}

  const filepaths = readDirFilenames(modelDirPath)

  // eslint-disable-next-line array-callback-return
  await Promise.all(filepaths.map((filepath) => {
    if (!/^.*?\.(js|json|yaml)$/.test(filepath)) {
      throw new Error('model supports js, json and yaml file')
    }
    let schema
    if (/^.*?\.(js|json)$/.test(filepath)) {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      schema = require(filepath)
    }
    if (/^.*?\.(yaml)$/.test(filepath)) {
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
    modelSchemas[modelName] = {
      model: {},
      ...schema
    }
    schemas[modelName] = {
      type: 'object', properties: model || {}
    }
  }))

  return {
    modelSchemas, schemas
  }
}

module.exports = async ({
  plugins = [],
  workspace,
  modelPath
}) => {
  let remoteMethods = {}
  let modelSchemas = {}
  let schemas = {}

  if (plugins.length > 0) {
    await Promise.all(plugins.map(async (pluginName) => {
      const pluginModelDirPath = path.join(workspace, `./plugins/${pluginName}/${modelPath}`)
      const pluginData = await buildModels(pluginModelDirPath)
      modelSchemas = _.merge(modelSchemas, pluginData.modelSchemas)
      schemas = _.merge(schemas, pluginData.schemas)
    }))
  }

  const modelDirPath = path.join(workspace, `./${modelPath}`)
  const modelData = await buildModels(modelDirPath)
  modelSchemas = _.merge(modelSchemas, modelData.modelSchemas)
  schemas = _.merge(schemas, modelData.schemas)

  // eslint-disable-next-line array-callback-return
  await Promise.all(Object.entries(modelSchemas).map(([modelName, modelSchema]) => {
    const remoteMethod = buildCrudRemoteMethods(_.lowerFirst(modelName), modelSchema)
    remoteMethods = {
      ...remoteMethods,
      ...Object.entries(remoteMethod).reduce((acc, [key, value]) => ({
        ...acc,
        [`${_.lowerFirst(modelName)}-${key}`]: value
      }), {})
    }
  }))

  return {
    remoteMethods, modelSchemas, schemas
  }
}
