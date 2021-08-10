const fs = require('fs')
const path = require('path')
const _ = require('lodash')
const yaml = require('js-yaml')
const readDirFilenames = require('read-dir-filenames')
const validateSchema = require('@galenjs/factories/validateJsonSchema')

module.exports = async modelDirPath => {
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
        modelDef = yaml.load(fs.readFileSync(filepath, 'utf8'))
      } catch (err) {
        throw new Error(`${filepath} load yaml file error`)
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
        dialect: { type: 'string', enum: ['sequelize', 'virtual', 'influx'] },
        properties: { type: 'object' },
        relations: { type: 'object' },
        indexes: { type: 'object' },
        remoteMethods: { type: 'object' }
      }
    })

    if (!modelDef.modelName) {
      modelDef.modelName = _.upperFirst(filename)
    }
    if (!modelDef.tableName) {
      modelDef.tableName = _.snakeCase(filename)
    }
    // only support virtual sequelize
    if (!modelDef.dialect) {
      modelDef.dialect = 'sequelize'
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

    if (modelDef.relations) {
      await Object.entries(modelDef.relations).reduce(async (promise, [key, value]) => {
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
        if (value.type === 'belongsTo') {
          const foreignKey = value.foreignKey || `${key}_id`
          modelDef.indexes = {
            ...(modelDef.indexes || []),
            [`${modelDef.tableName}_${foreignKey}`]: [{
              type: 'index',
              fields: [foreignKey]
            }]
          }
        }
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
    const { modelName } = modelDef
    modelDefs[modelName] = {
      properties: modelDef.dialect === 'sequelize' ? {
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
