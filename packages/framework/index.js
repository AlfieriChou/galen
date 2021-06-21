const Koa = require('koa')
const compose = require('koa-compose')
const assert = require('assert')

const loadModels = require('@galenjs/base')
const buildRouter = require('@galenjs/koa-router')
/* eslint-disable */
const loadSequelizeModels = require('@galenjs/sequelize-models')
const createRedisClients = require('@galenjs/redis')
const createInfluxClient = require('@galenjs/influx')
/* eslint-disable */

const gracefulExit = require('./lib/gracefulExit')
const validateConfig = require('./lib/validateConfig')
const loadController = require('./lib/loadController')
const loadService = require('./lib/loadService')
const loadMiddleware = require('./lib/loadMiddleware')

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
      plugins: this.config.plugin ? this.config.plugin.plugins : [],
      workspace: this.config.workspace,
      modelPath: this.config.modelPath
    })
    this.ctx.remoteMethods = remoteMethods
    this.remoteMethods = remoteMethods
    this.ctx.modelSchemas = modelSchemas
    this.modelSchemas = modelSchemas
    this.ctx.schemas = schemas
    this.schemas = schemas

    const router = await buildRouter({
      remoteMethods,
      modelSchemas
    })

    this.ctx.controller = await loadController(this.config)
    this.ctx.service = await loadService(this.config)
    this.middleware = {
      cors: () => async (ctx, next) => {
        ctx.set(
          'Access-Control-Allow-Origin',
          this.config.cors ? this.config.cors.origin : ctx.request.header.origin
        )
        ctx.set('Access-Control-Allow-Credentials', true)
        ctx.set(
          'Access-Control-Max-Age',
          this.config.cors ? this.config.cors.maxAge : 86400000
        )
        ctx.set(
          'Access-Control-Allow-Methods',
          this.config.cors ? this.config.cors.allowMethods : 'OPTIONS, GET, PUT, POST, DELETE'
        )
        ctx.set(
          'Access-Control-Allow-Headers',
          this.config.cors ? this.config.cors.allowHeaders : 'x-requested-with, accept, origin, content-type'
        )
        await next()
      },
      ...loadMiddleware(this.config),
      router: () => compose([router.routes(), router.allowedMethods()])
    }
    
    if (this.config.sequelize) {
      this.ctx.models = await loadSequelizeModels(modelSchemas, this.config.sequelize)
    }
    if (this.config.redis) {
      this.ctx.redis = await createRedisClients(this.config.redis)
    }
    if (this.config.influx) {
      this.ctx.influx = await createInfluxClient(modelSchemas, this.config.influx)
    }
  }

  get coreMiddleware () {
    return Object.keys(this.middleware)
  }

  async loadMiddleware (middlewareNames) {
    await (
      middlewareNames || this.coreMiddleware
    ).reduce(async (promise, middlewareName) => {
      await promise
      this.app.use(this.middleware[middlewareName]())
    }, Promise.resolve())
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
    const server = await this.listen(this.config.port)
    await this.softExit(server)
  }
}
