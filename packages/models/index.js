const readDirFilenames = require('read-dir-filenames')
const _ = require('lodash')
const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')
const validateSchema = require('@galenjs/factories/validateJsonSchema')

const buildRemoteMethods = require('./lib/remoteMethods')

const buildModelDefs = async modelDirPath => {
  const modelDefs = {}

  const filepaths = readDirFilenames(modelDirPath)

  // eslint-disable-next-line array-callback-return
  await Promise.all(filepaths.map(async filepath => {
    if (!/^.*?\.(json|yaml)$/.test(filepath)) {
      throw new Error('model supports js, json and yaml file')
    }
    let modelDef
    if (/^.*?\.(json)$/.test(filepath)) {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      modelDef = require(filepath)
    }
    if (/^.*?\.(yaml)$/.test(filepath)) {
      try {
        modelDef = yaml.safeLoad(fs.readFileSync(filepath, 'utf8'))
      } catch (err) {
        throw new Error(`${filepath.split('/').slice(-1)[0]} load yaml file error`)
      }
    }

    const filename = path.basename(filepath).replace(/\.\w+$/, '')

    await validateSchema(modelDef, {
      type: 'object',
      properties: {
        databaseName: { type: 'string' },
        tags: { type: 'array', items: { type: 'string' } },
        tableName: { type: 'string' },
        modelName: { type: 'string' },
        dialect: { type: 'string', enum: ['mysql', 'virtual', 'influx'] },
        properties: { type: 'object' },
        relations: { type: 'object' },
        indexes: { type: 'object' },
        remoteMethods: { type: 'object' }
      }
    })
    if (modelDef.relations) {
      await Object.entries(modelDef.relations).reduce(async (promise, [, value]) => {
        await promise
        await validateSchema(value, {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['belongsTo', 'hasOne', 'belongsToMany'] },
            model: { type: 'string' },
            primaryKey: { type: 'string' },
            foreignKey: { type: 'string' },
            through: { type: 'string' }
          },
          required: ['type', 'model']
        })
      }, Promise.resolve())
    }
    if (modelDef.indexes) {
      await Object.entries(modelDef.indexes).reduce(async (promise, [, value]) => {
        await promise
        await validateSchema(value, {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['index', 'unique'] },
            fields: { type: 'array', items: { type: 'string' } }
          },
          required: ['type', 'fields']
        })
      }, Promise.resolve())
    }
    if (modelDef.properties) {
      await Object.entries(modelDef.properties).reduce(async (promise, [, value]) => {
        await promise
        await validateSchema(value, {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: [
                'integer', 'bigint', 'float', 'double',
                'decimal', 'text', 'string', 'date',
                'boolean', 'float', 'json', 'array',
                'uuid', 'uuidv1', 'uuidv4'
              ]
            },
            autoIncrement: { type: 'boolean' },
            description: { type: 'string' },
            length: { type: 'number' },
            maxLength: { type: 'number' },
            minLength: { type: 'number' },
            allowNull: { type: 'boolean' },
            validate: { type: 'object' },
            enum: { type: 'array', items: { type: 'string' } }
          },
          required: ['type']
        })
      }, Promise.resolve())
    }
    if (modelDef.remoteMethods) {
      await Object.entries(modelDef.remoteMethods).reduce(async (promise, [, value]) => {
        await promise
        await validateSchema(value, {
          type: 'object',
          properties: {
            path: { type: 'string' },
            method: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
            summary: { type: 'string' },
            requestBody: {
              type: 'object',
              properties: {
                body: { type: 'object' },
                required: { type: 'array', items: { type: 'string' } }
              }
            },
            params: { type: 'object' },
            query: { type: 'object' },
            output: { type: 'object' }
          },
          required: ['path', 'method']
        })
      }, Promise.resolve())
    }

    if (!modelDef.modelName) {
      modelDef.modelName = _.upperFirst(filename)
    }
    if (!modelDef.tableName) {
      modelDef.tableName = _.snakeCase(filename)
    }
    // support virtual mysql
    if (!modelDef.dialect) {
      modelDef.dialect = 'mysql'
    }
    const { modelName } = modelDef
    modelDefs[modelName] = {
      properties: modelDef.dialect === 'mysql' ? {
        id: {
          type: 'integer',
          autoIncrement: true,
          primaryKey: true
        }
      } : {},
      ...modelDef
    }
  }))

  return modelDefs
}

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
            jsonSchema.properties[`${key}Id`] = _.pick(
              (relationModelDef.properties.id || { type: 'integer' }),
              ['type', 'description']
            )
            modelDefs[modelName].indexes = [
              ...(modelDefs[modelName].indexes || []),
              {
                [`${tableName}_${key}_id`]: [{
                  type: 'index',
                  fields: [`${key}Id`]
                }]
              }]
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
