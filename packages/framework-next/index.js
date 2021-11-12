const Koa = require('koa')
const compose = require('koa-compose')
const createModelsRest = require('@galenjs/models-rest')
const als = require('@galenjs/als')
const createLogger = require('@galenjs/logger')
const shortId = require('shortid')

const bindToContext = require('./lib/context')
const gracefulExit = require('./lib/gracefulExit')
const validateConfig = require('./lib/validateConfig')

module.exports = class Application {
  constructor (config) {
    this.config = config
    this.logger = console
    this.als = als
  }

  async beforeInit () {
    await validateConfig(this.config)
    await bindToContext(this.config)
    const app = new Koa()
    this.app = app
    this.app.pendingCount = 0
    if (this.config.loggerOptions) {
      this.logger = createLogger(this.config.loggerOptions, this.als)
    }
    this.app.coreLogger = this.logger
    this.app.context.logger = this.logger
    this.app.als = this.als
    this.app.context.als = this.als
    this.app.use(async (ctx, next) => {
      await this.als.run({
        requestId: ctx.headers['X-Request-Id'] || shortId.generate(),
        method: ctx.method,
        originalUrl: ctx.originalUrl
      }, async () => {
        await next()
      })
    })
  }

  // eslint-disable-next-line no-empty-function
  async afterInit () {}

  async init () {
    await this.beforeInit()

    const router = await createModelsRest({
      remoteMethods: this.app.context.remoteMethods,
      prefix: this.config.apiPrefix || '/v2'
    })

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
      ...this.app.context.middleware,
      router: () => compose([router.routes(), router.allowedMethods()])
    }

    await this.afterInit()
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

  // eslint-disable-next-line no-empty-function
  async beforeClose () {}

  // eslint-disable-next-line no-empty-function
  async afterClose () {}

  async closed () {
    await this.beforeClose()
    if (this.app.context.redis) {
      await this.app.context.redis.quit(this.logger)
    }
    await this.afterClose()
  }

  async start () {
    const server = await this.listen(this.config.port)
    if (this.schedule) {
      await this.schedule.init(this.app.context)
    }
    await gracefulExit(server, async () => {
      if (this.app.pendingCount === 0) {
        await this.closed()
      } else {
        this.app.on('pendingCount0', async () => {
          await this.closed()
        })
      }
    }, this.logger)
  }
}
