const _ = require('lodash')
const path = require('path')
const assert = require('assert')

const buildRemoteMethods = require('./lib/remoteMethods')
const buildModelDefs = require('./lib/modelDefs')
const createDataSources = require('./lib/dataSource')
const buildModel = require('./lib/mixinModel')

module.exports = async ({
  plugin,
  workspace,
  modelPath,
  modelDefPath,
  config = {}
}) => {
  let remoteMethods = {}
  let modelDefs = {}
  const jsonSchemas = {}
  let models = {}

  const dataSources = await createDataSources(config)

  if (plugin) {
    const { mainPath, plugins } = plugin
    await Promise.all(plugins.map(async pluginName => {
      const pluginModelDefDirPath = path.join(workspace, `./${mainPath}/${pluginName}/${modelDefPath}`)
      const pluginModelDefs = await buildModelDefs(pluginModelDefDirPath)
      modelDefs = _.merge(modelDefs, pluginModelDefs)
    }))
  }

  const modelDefDirPath = path.join(workspace, `./${modelDefPath}`)
  const mainModelDefs = await buildModelDefs(modelDefDirPath)
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
        assert(createModel, `${dialect} required exports createModel method`)
        assert(migrate, `${dialect} required exports migrate method`)
        if (dataSources[dataSource]) {
          await migrate(
            dataSources[dataSource],
            {
              modelDef, jsonSchema
            }
          )
          models[modelName] = await createModel(
            dataSources[dataSource],
            {
              modelDef, jsonSchema
            }
          )
        }
      })
  )

  // sequelize存在需要将表信息创建完后才能建立关联关系的问题
  await Object.entries(modelDefs).reduce(async (promise, [modelName, modelDef]) => {
    await promise
    if (modelDef.dialect === 'sequelize' && models[modelName]) {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      const { createRelations } = require(`./dialects/${modelDef.dialect}`)
      assert(createRelations, `${modelDef.dialect} required exports createRelations method`)
      await createRelations(models, modelDef)
    }
  }, Promise.resolve())

  if (plugin) {
    const { mainPath, plugins } = plugin
    await Promise.all(plugins.map(async pluginName => {
      const pluginModelDirPath = path.join(workspace, `./${mainPath}/${pluginName}/${modelPath}`)
      models = await buildModel(pluginModelDirPath, models)
    }))
  }

  const modelDirPath = path.join(workspace, `./${modelPath}`)
  models = await buildModel(modelDirPath, models)

  return {
    remoteMethods, modelDefs, jsonSchemas, dataSources, models
  }
}
