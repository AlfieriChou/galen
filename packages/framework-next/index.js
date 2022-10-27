const compose = require('koa-compose')
const createModelsRest = require('@galenjs/models-rest')
const shortId = require('shortid')
const assert = require('assert')

const bindToContext = require('./lib/context')
const gracefulExit = require('./lib/gracefulExit')
const validateConfig = require('./lib/validateConfig')
const KoaApplication = require('./lib/application')

module.exports = class Application {
  constructor (config) {
    this.config = config
  }

  async beforeInit () {
    await validateConfig(this.config)
    await bindToContext(this.config)
    this.app = new KoaApplication(this.config)
    this.app.use(async (ctx, next) => {
      const requestId = ctx.get('X-Request-Id') || shortId.generate()
      ctx.state.requestId = requestId
      await this.app.als.run({
        requestId,
        method: ctx.method,
        originalUrl: ctx.originalUrl
      }, async () => {
        await next()
      })
    })
  }

  async afterInit () {
    if (this.config.pyroscope) {
      assert(this.config.pyroscope.serverAddress, 'pyroscope server address is required')
      assert(this.config.pyroscope.serverAddress, 'pyroscope app name is required')
      // eslint-disable-next-line global-require, import/no-unresolved
      const Pyroscope = require('@pyroscope/nodejs')
      Pyroscope.init({
        serverAddress: this.config.pyroscope.serverAddress,
        appName: this.config.pyroscope.appName
      })
      Pyroscope.start()
    }
  }

  async init () {
    await this.beforeInit()

    const router = await createModelsRest({
      remoteMethods: this.app.context.remoteMethods,
      prefix: this.config.apiPrefix || '/v2'
    })

    this.middleware = {
      timing: () => async (ctx, next) => {
        let error
        ctx.set('X-Response-Id', ctx.state.requestId)
        const { timing } = ctx
        timing.start('Total')
        try {
          await next()
        } catch (e) {
          error = e
        }
        timing.end('*')
        ctx.set('Server-Timing', timing.toServerTiming())
        const { use } = timing.toJSON(true)[0]
        ctx.set('X-Response-Time', `${use}ms`)
        if (error) {
          throw error
        }
        const log = `${ctx.status} ${timing.toString()}`
        if (use > 10000) {
          ctx.logger.error('[timing]: ', log)
          return
        }
        if (use > 3000) {
          ctx.logger.warn('[timing]: ', log)
          return
        }
        if (use > 0) {
          ctx.logger.info('[timing]: ', log)
        }
      },
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
      this.app.coreLogger.info(`✅  The server is running at http://localhost:${port}`)
    })
  }

  // eslint-disable-next-line no-empty-function
  async beforeClose () {}

  // eslint-disable-next-line no-empty-function
  async afterClose () {}

  async closed () {
    await this.beforeClose()
    if (this.app.context.redis) {
      await this.app.context.redis.quit(this.app.coreLogger)
    }
    await this.afterClose()
  }

  createContext () {
    return this.app.context
  }

  async start () {
    const server = await this.listen(this.config.port)
    await gracefulExit(server, async () => {
      if (this.app.pendingCount === 0) {
        await this.closed()
      } else {
        this.app.on('pendingCount0', async () => {
          await this.closed()
        })
      }
    }, this.app.coreLogger)
  }
}
