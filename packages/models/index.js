const _ = require('lodash')
const path = require('path')

const buildRemoteMethods = require('./lib/remoteMethods')
const buildModelDefs = require('./lib/modelDefs')
const createDataSources = require('./lib/dataSource')

module.exports = async ({
  plugins = [],
  workspace,
  modelPath,
  config = {}
}) => {
  let remoteMethods = {}
  let modelDefs = {}
  const jsonSchemas = {}
  const models = {}

  const dataSources = await createDataSources(config)

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

  await Promise.all(
    Object.entries(modelDefs)
      .map(async ([modelName, modelDef]) => {
        const {
          properties, relations, description, dialect, dataSource
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
        // eslint-disable-next-line import/no-dynamic-require, global-require
        const { createModel, migrate } = require(`./dialects/${dialect}`)
        if (dataSources[dataSource]) {
          await migrate(
            dataSources[dataSource],
            {
              modelDef, jsonSchema
            }
          )
          models[modelName] = createModel(
            dataSources[dataSource],
            {
              modelDef, jsonSchema
            }
          )
        }
      })
  )

  return {
    remoteMethods, modelDefs, jsonSchemas, dataSources, models
  }
}
