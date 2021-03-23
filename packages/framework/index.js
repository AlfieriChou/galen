const Koa = require('koa')
// const bodyParser = require('koa-bodyparser')

const validateJsonSchema = require('@galenjs/func/validateJsonSchema')
const loadModels = require('@galenjs/base')
const loadSequelizeModels = require('@galenjs/sequelize-models')
const createRedisClients = require('@galenjs/redis')

const loadConfig = (config) => {
  validateJsonSchema(config, {
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
  return config
}

module.exports = class Application {
  constructor (config) {
    this.config = loadConfig(config)
  }

  async init () {
    const app = new Koa()
    const { remoteMethods, modelSchemas, schemas } = await loadModels({
      workspace: this.config.workspace,
      modelPath: this.config.modelPath
    })
    app.context.remoteMethods = remoteMethods
    app.context.modelSchemas = modelSchemas
    app.context.schemas = schemas
    if (this.config.sequelizeOptions) {
      app.context.models = await loadSequelizeModels(modelSchemas, this.config.sequelizeOptions)
    }
    if (this.config.redisOptions) {
      app.context.redis = await createRedisClients(this.config.redisOptions)
    }
    return app
  }
}
