const Koa = require('koa')
const compose = require('koa-compose')
const createModelsRest = require('@galenjs/models-rest')

const bindToContext = require('./lib/context')
const gracefulExit = require('./lib/gracefulExit')
const validateConfig = require('./lib/validateConfig')

module.exports = class Application {
  constructor (config) {
    this.config = config
    this.logger = console
  }

  async init () {
    await bindToContext(this.config)
    await validateConfig(this.config)
    const app = new Koa()

    this.app = app
    this.app.pendingCount = 0
    const router = await createModelsRest({
      remoteMethods: app.context.remoteMethods,
      prefix: '/v2'
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
  }

  async softExit (server) {
    await gracefulExit(server, async () => {
      if (this.app.pendingCount === 0) {
        await this.closed()
      } else {
        this.app.on('pendingCount0', async () => {
          await this.closed()
        })
      }
    })
  }

  async start () {
    const server = await this.listen(this.config.port)
    await this.softExit(server)
  }
}
