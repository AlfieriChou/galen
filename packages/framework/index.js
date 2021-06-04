const Koa = require('koa')
const fs = require('fs')
const assert = require('assert')

const loadModels = require('@galenjs/base')
const buildRouter = require('@galenjs/koa-router')
/* eslint-disable */
const loadSequelizeModels = require('@galenjs/sequelize-models')
const createRedisClients = require('@galenjs/redis')
const createInfluxClient = require('@galenjs/influx')
const classLoader = require('@galenjs/class-loader')
/* eslint-disable */

const gracefulExit = require('./lib/gracefulExit')
const validateConfig = require('./lib/validateConfig')

module.exports = class Application {
  constructor (config) {
    this.config = config
    this.pendingCount = 0
    this.logger = console
  }

  async init () {
    await validateConfig(this.config)
    const app = new Koa()
    this.app = app
    this.ctx = app.context
    const { remoteMethods, modelSchemas, schemas } = await loadModels({
      workspace: this.config.workspace,
      modelPath: this.config.modelPath
    })
    this.ctx.remoteMethods = remoteMethods
    this.remoteMethods = remoteMethods
    this.ctx.modelSchemas = modelSchemas
    this.modelSchemas = modelSchemas
    this.ctx.schemas = schemas
    this.schemas = schemas
    if (this.config.sequelize) {
      this.ctx.models = await loadSequelizeModels(modelSchemas, this.config.sequelize)
    }
    if (this.config.redis) {
      this.ctx.redis = await createRedisClients(this.config.redis)
    }
    if (this.config.influx) {
      this.ctx.influx = await createInfluxClient(modelSchemas, this.config.influx)
    }
    if (this.config.controllerPath) {
      this.ctx.controller = fs.existsSync(controllerPath) ? classLoader(controllerPath) : {}
    }
    if (this.config.servicePath) {
      this.ctx.service = fs.existsSync(servicePath) ? classLoader(servicePath) : {}
    }
    this.app.use(async (ctx) => {
      this.pendingCount += 1
      if (ctx.request.method === 'OPTIONS') {
        ctx.response.status = 200
      }
      try {
        await next()
      } catch (err) {
        this.logger.error('error: ', err)
        ctx.status = err.status || 500
        ctx.body = {
          code: ctx.status,
          message: err.message
        }
      } finally {
        this.pendingCount -= 1
        if (this.pendingCount === 0) {
          ctx.app.emit('pendingCount0')
        }
      }
    })
  }

  async loadRoutes (remoteMethods, modelSchemas) {
    const router = await buildRouter({
      remoteMethods,
      modelSchemas
    })
    this.app.use(router.routes())
    this.app.use(router.allowedMethods())
  }

  async listen (port = 4000) {
    return this.app.listen(port, () => {
      this.logger.info(`✅  The server is running at http://localhost:${port}`)
    })
  }

  async closed () {
    if (this.app.context.redis) {
      await this.app.context.redis.quit()
    }
    if (this.app.context.models) {
      await this.app.context.models.quit()
    }
  }

  async softExit (server) {
    await gracefulExit(server, async () => {
      if (this.pendingCount === 0) {
        await this.closed()
      } else {
        this.app.on('pendingCount0', async () => {
          await this.closed()
        })
      }
    })
  }

  async start () {
    assert(this.remoteMethods, 'should init framework')
    assert(this.modelSchemas, 'should init framework')
    await this.loadRoutes(this.remoteMethods, this.modelSchemas)
    const server = await this.listen(this.config.port)
    await this.softExit(server)
  }
}
