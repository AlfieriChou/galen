const { AsyncLocalStorage } = require('async_hooks')

class ALS {
  constructor () {
    this.als = new AsyncLocalStorage()
  }

  async run (context, callback, args) {
    return this.als.run(context, callback, args)
  }

  get () {
    return this.als.getStore()
  }
}

module.exports = new ALS()
