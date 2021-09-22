const Koa = require('koa')
const createModelsRest = require('@galenjs/models-rest')

const bindToContext = require('./lib/context')

module.exports = class Application {
  constructor (config) {
    this.config = config
  }

  async getApp () {
    return new Koa()
  }

  async init () {
    await bindToContext({
      models: this.config.models
    })
    const app = await this.getApp()
    const router = await createModelsRest({
      remoteMethods: app.context.remoteMethods,
      prefix: '/v2'
    })

    app.use(router.routes())
    app.use(router.allowedMethods())

    app.listen(this.config.port, () => {
      console.info(`✅  The server is running at http://localhost:${this.config.port}`)
    })
  }
}
