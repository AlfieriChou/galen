const _ = require('lodash')
const path = require('path')

const buildRemoteMethods = require('./lib/remoteMethods')
const buildModelDefs = require('./lib/modelDefs')

module.exports = async ({
  plugins = [],
  workspace,
  modelPath
}) => {
  let remoteMethods = {}
  let modelDefs = {}
  const jsonSchemas = {}

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
      properties, relations, tableName
    } = modelDef
    const jsonSchema = {
      type: 'object',
      properties: properties || {}
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
