const Koa = require('koa')
// const bodyParser = require('koa-bodyparser')

const validateJsonSchema = require('@galenjs/func/validateJsonSchema')
const loadModels = require('@galenjs/base')
const loadSequelizeModels = require('@galenjs/sequelize-models')
const createRedisClients = require('@galenjs/redis')

module.exports = async (config) => {
  await validateJsonSchema(config, {
    type: 'object',
    properties: {
      port: { type: 'number' },
      workspace: { type: 'string' },
      modelPath: { type: 'string' },
      sequelizeOptions: {
        type: 'object',
        properties: {
          default: {
            type: 'object',
            properties: {
              host: { type: 'string' },
              database: { type: 'string' },
              user: { type: 'string' },
              password: { type: 'string' },
              debug: { type: 'boolean' },
              pool: {
                type: 'object',
                properties: {
                  min: { type: 'integer' },
                  max: { type: 'integer' }
                }
              }
            },
            required: ['host', 'database', 'user', 'password']
          },
          clients: {
            type: 'object'
          }
        },
        required: ['default', 'clients']
      },
      redisOptions: {
        type: 'object',
        properties: {
          default: {
            type: 'object',
            properties: {
              host: { type: 'string' },
              port: { type: 'number' },
              password: { type: 'string' },
              db: { type: 'number' },
              keyPrefix: { type: 'string' }
            }
          },
          clients: {
            type: 'object'
          }
        },
        required: ['default', 'clients']
      }
    },
    required: ['port', 'workspace', 'modelPath']
  })
  const app = new Koa()
  const { remoteMethods, modelSchemas, schemas } = await loadModels({
    workspace: config.workspace,
    modelPath: config.modelPath
  })
  app.context.remoteMethods = remoteMethods
  app.context.modelSchemas = modelSchemas
  app.context.schemas = schemas
  if (config.sequelizeOptions) {
    app.context.models = await loadSequelizeModels(modelSchemas, config.sequelizeOptions)
  }
  if (config.redisOptions) {
    app.context.redis = await createRedisClients(config.redisOptions)
  }
  return app
}
