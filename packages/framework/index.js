const Koa = require('koa')

const validateJsonSchema = require('@galenjs/factories/validateJsonSchema')
const loadModels = require('@galenjs/base')
const buildRouter = require('@galenjs/koa-router')
/* eslint-disable */
const loadSequelizeModels = require('@galenjs/sequelize-models')
const createRedisClients = require('@galenjs/redis')
/* eslint-disable */

const gracefulExit = require('./lib/gracefulExit')

const validateConfig = async (config) => {
  await validateJsonSchema(config, {
    type: 'object',
    properties: {
      port: { type: 'number' },
      workspace: { type: 'string' },
      modelPath: { type: 'string' },
      sequelize: {
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
      redis: {
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
    this.config = config
    this.pendingCount = 0
  }

  async init () {
    await validateConfig(this.config)
    const app = new Koa()
    const { remoteMethods, modelSchemas, schemas } = await loadModels({
      workspace: this.config.workspace,
      modelPath: this.config.modelPath
    })
    app.context.remoteMethods = remoteMethods
    this.remoteMethods = remoteMethods
    app.context.modelSchemas = modelSchemas
    this.modelSchemas = modelSchemas
    app.context.schemas = schemas
    this.schemas = schemas
    if (this.config.sequelize) {
      app.context.models = await loadSequelizeModels(modelSchemas, this.config.sequelize)
    }
    if (this.config.redis) {
      app.context.redis = await createRedisClients(this.config.redis)
    }
    this.app = app
    this.ctx = app.context
  }

  async loadRoutes () {
    const router = await buildRouter({
      remoteMethods: this.remoteMethods,
      modelSchemas: this.modelSchemas
    })
    this.app.use(router.routes())
    this.app.use(router.allowedMethods())
  }

  async closed () {
    if (this.app.context.redis) {
      await this.app.context.redis.quit()
    }
    if (this.app.context.models) {
      await this.app.context.models.quit()
    }
  }

  async listen () {
    const server = this.app.listen(this.config.port, () => {
      // eslint-disable-next-line no-console
      console.log(`✅  The server is running at http://localhost:${this.config.port}`)
    })
  
    gracefulExit(server, async () => {
      if (this.pendingCount === 0) {
        await this.closed()
      } else {
        this.app.on('pendingCount0', async () => {
          await this.closed()
        })
      }
    })
  }
}
