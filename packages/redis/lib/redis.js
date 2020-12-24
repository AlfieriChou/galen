const Redis = require('ioredis')

module.exports = class RedisService {
  constructor (options) {
    this.redis = new Redis(options)
  }

  getRedis (name) {
    return this.redis.get(name)
  }

  async get (name, key) {
    return this.getRedis(name).get(key)
  }

  async decr (name, key, expire) {
    if (expire) {
      return this.getRedis(name).multi().decr(key)
        .expire(key, Math.floor(expire))
        .exec()
        .then(([[, count]]) => count)
    }
    return this.getRedis(name).decr(key)
  }

  async incr (name, key, expire) {
    if (expire) {
      return this.getRedis(name).multi().incr(key)
        .expire(key, Math.floor(expire))
        .exec()
        .then(([[, count]]) => count)
    }
    return this.getRedis(name).incr(key)
  }

  async getJson (name, key) {
    return this.getRedis(name).hgetall(key)
  }

  async setJson (name, key, obj, expire) {
    if (expire) {
      return this.getRedis(name).multi()
        .hmset(key, obj)
        .expire(key, Math.floor(expire))
        .exec()
    }
    return this.getRedis(name).hmset(key, obj)
  }
}
