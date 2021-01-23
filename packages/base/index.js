const readDirFilenames = require('read-dir-filenames')
const _ = require('lodash')
const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')

const buildCrudRemoteMethods = require('./lib/remoteMethods')
const validateSchema = require('./lib/validateSchema')

const buildModels = async (modelDirPath) => {
  const modelSchemas = {}

  const filepaths = readDirFilenames(modelDirPath)

  // eslint-disable-next-line array-callback-return
  await Promise.all(filepaths.map(async (filepath) => {
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

    await validateSchema(schema, {
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
    if (schema.relations) {
      await Object.entries(schema.relations).reduce(async (promise, [, value]) => {
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
    if (schema.indexes) {
      await Object.entries(schema.indexes).reduce(async (promise, [, value]) => {
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
    if (schema.properties) {
      await Object.entries(schema.properties).reduce(async (promise, [, value]) => {
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
    if (schema.remoteMethods) {
      await Object.entries(schema.remoteMethods).reduce(async (promise, [, value]) => {
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
    const { modelName } = schema
    modelSchemas[modelName] = {
      properties: schema.dialect === 'mysql' ? {
        id: {
          type: 'integer',
          autoIncrement: true,
          primaryKey: true
        }
      } : {},
      ...schema
    }
  }))

  return modelSchemas
}

module.exports = async ({
  plugins = [],
  workspace,
  modelPath
}) => {
  let remoteMethods = {}
  let modelSchemas = {}
  const schemas = {}

  if (plugins.length > 0) {
    await Promise.all(plugins.map(async (pluginName) => {
      const pluginModelDirPath = path.join(workspace, `./plugins/${pluginName}/${modelPath}`)
      const pluginModelSchemas = await buildModels(pluginModelDirPath)
      modelSchemas = _.merge(modelSchemas, pluginModelSchemas)
    }))
  }

  const modelDirPath = path.join(workspace, `./${modelPath}`)
  const mainModelSchemas = await buildModels(modelDirPath)
  modelSchemas = _.merge(modelSchemas, mainModelSchemas)

  Object.entries(modelSchemas).forEach(([modelName, modelSchema]) => {
    const schema = {
      type: 'object',
      properties: modelSchema.properties || {}
    }
    if (modelSchema.relations) {
      Object.entries(modelSchema.relations).forEach(
        ([key, { type, model }]) => {
          if (type === 'belongsTo') {
            const relationIdProps = modelSchemas[model].properties.id || { type: 'integer' }
            schema.properties[`${key}Id`] = _.pick(relationIdProps, ['type', 'description'])
          }
        }
      )
    }
    schemas[modelName] = schema
    const remoteMethod = buildCrudRemoteMethods(_.lowerFirst(modelName), modelSchema)
    remoteMethods = {
      ...remoteMethods,
      ...Object.entries(remoteMethod).reduce((acc, [key, value]) => ({
        ...acc,
        [`${_.lowerFirst(modelName)}-${key}`]: value
      }), {})
    }
  })
  return {
    remoteMethods, modelSchemas, schemas
  }
}
