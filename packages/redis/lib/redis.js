const Redis = require('ioredis')

module.exports = class RedisService {
  constructor (options) {
    this.redis = Object.entries({
      main: {},
      ...options.clients
    }).reduce((ret, [serviceName, config]) => {
      if (typeof config !== 'object') {
        throw new Error('client config must be an object')
      }
      return {
        ...ret,
        [serviceName]: new Redis({
          ...options.default,
          ...config
        })
      }
    }, {})
  }

  select (name) {
    return this.redis[name]
  }

  async get (name, key) {
    return this.select(name).get(key)
  }

  async set (name, key, value, expire) {
    if (!expire) {
      return this.select(name).set(key, value)
    }
    return this.select(name).multi().set(key, value)
      .expire(key, Math.floor(expire))
      .exec()
  }

  async decr (name, key, expire) {
    if (expire) {
      return this.select(name).multi().decr(key)
        .expire(key, Math.floor(expire))
        .exec()
        .then(([[, count]]) => count)
    }
    return this.select(name).decr(key)
  }

  async incr (name, key, expire) {
    if (expire) {
      return this.select(name).multi().incr(key)
        .expire(key, Math.floor(expire))
        .exec()
        .then(([[, count]]) => count)
    }
    return this.select(name).incr(key)
  }

  async getJson (name, key) {
    return this.select(name).hgetall(key)
  }

  async setJson (name, key, obj, expire) {
    if (expire) {
      return this.select(name).multi()
        .hmset(key, obj)
        .expire(key, Math.floor(expire))
        .exec()
    }
    return this.select(name).hmset(key, obj)
  }
}
