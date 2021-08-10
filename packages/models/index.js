const _ = require('lodash')
const path = require('path')

const buildRemoteMethods = require('./lib/remoteMethods')
const buildModelDefs = require('./lib/modelDefs')

module.exports = async ({
  plugins = [],
  workspace,
  modelPath,
  config = {}
}) => {
  let remoteMethods = {}
  let modelDefs = {}
  const jsonSchemas = {}
  const dataSources = {}

  Object.entries(config).forEach(([dataSourceName, dataSourceConfig]) => {
    // eslint-disable-next-line import/no-dynamic-require,global-require
    dataSources[dataSourceName] = require(`./dialects/${dataSourceConfig.dataSource}`).createDataSource(dataSourceConfig.options)
  })

  if (plugins.length > 0) {
    await Promise.all(plugins.map(async pluginName => {
      const pluginModelDirPath = path.join(workspace, `./plugins/${pluginName}/${modelPath}`)
      const pluginModelDefs = await buildModelDefs(pluginModelDirPath)
      modelDefs = _.merge(modelDefs, pluginModelDefs)
    }))
  }

  const modelDirPath = path.join(workspace, `./${modelPath}`)
  const mainModelDefs = await buildModelDefs(modelDirPath)
  modelDefs = _.merge(modelDefs, mainModelDefs)

  Object.entries(modelDefs).forEach(([modelName, modelDef]) => {
    const {
      properties, relations, tableName, description
    } = modelDef
    const jsonSchema = {
      type: 'object',
      properties: properties || {},
      description: description || ''
    }
    if (relations) {
      Object.entries(relations).forEach(
        ([key, relation]) => {
          if (relation.type === 'belongsTo') {
            const relationModelDef = modelDefs[relation.model]
            const foreignKey = relation.foreignKey || `${key}Id`
            jsonSchema.properties[foreignKey] = _.pick(
              (relationModelDef.properties.id || { type: 'integer' }),
              ['type', 'description']
            )
            modelDefs[modelName].indexes = {
              ...(modelDefs[modelName].indexes || []),
              [`${tableName}_${key}_id`]: [{
                type: 'index',
                fields: [foreignKey]
              }]
            }
          }
        }
      )
    }
    jsonSchemas[modelName] = jsonSchema
    remoteMethods = {
      ...remoteMethods,
      ...Object.entries(
        buildRemoteMethods(
          _.lowerFirst(modelName),
          modelDef
        )
      ).reduce((acc, [key, value]) => ({
        ...acc,
        [`${_.lowerFirst(modelName)}-${key}`]: value
      }), {})
    }
  })
  return {
    remoteMethods, modelDefs, jsonSchemas
  }
}
