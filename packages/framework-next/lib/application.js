const Application = require('koa')
const als = require('@galenjs/als')
const createLogger = require('@galenjs/logger')

module.exports = class KoaApplication extends Application {
  constructor (config) {
    super()
    this.pendingCount = 0
    this.config = config
    this.projectRootPath = config.projectRootPath || process.cwd()
    this.als = als
    this.context.als = als
    this.coreLogger = config.loggerOptions ? createLogger(config.loggerOptions, als) : console
    this.logger = this.coreLogger
    this.context.logger = this.coreLogger
  }
}
