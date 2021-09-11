const Redis = require('ioredis')
const assert = require('assert')

module.exports = class RedisService {
  constructor (options) {
    this.redis = new Map(Object.entries({
      main: {},
      ...options.clients
    }).reduce((ret, [serviceName, config]) => {
      if (typeof config !== 'object') {
        throw new Error('client config must be an object')
      }
      return [
        ...ret,
        [serviceName, new Redis({
          ...options.default,
          ...config
        })]
      ]
    }, []))
  }

  async quit (log) {
    const logger = log || console
    await [...this.redis.keys()]
      .reduce(async (promise, key) => {
        await promise
        logger.info('[@galenjs/redis] client ', `{${key}} `, 'start close')
        await this.redis.get(key).quit()
        logger.info('[@galenjs/redis] client ', `{${key}} `, 'closed')
      }, Promise.resolve())
  }

  select (name) {
    return this.redis.get(name)
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

  async getList (name, key, start, end) {
    assert(start >= 0, 'list start is required')
    assert(end >= 0, 'list end is required')
    return this.select(name).lrange(key, start, end)
  }

  async getListLength (name, key) {
    return this.select(name).llen(key)
  }

  async setList (name, key, list, expire) {
    assert(list.length > 0, 'list must be non-empty')
    if (expire) {
      return this.select(name).multi()
        .lpush(key, ...list)
        .expire(key, Math.floor(expire))
        .exec()
    }
    return this.select(name).lpush(key, ...list)
  }

  async getMembers (name, key) {
    return this.select(name).smembers(key)
  }

  async getMembersLength (name, key) {
    return this.select(name).scard(key)
  }

  async setMembers (name, key, members, expire) {
    assert(members.length > 0, 'members must be non-empty')
    if (expire) {
      return this.select(name).multi()
        .sadd(key, ...members)
        .expire(key, Math.floor(expire))
        .exec()
    }
    return this.select(name).sadd(key, ...members)
  }

  async execLimit ({
    name, key, times, expires
  }) {
    assert(name, 'name must be non-empty')
    assert(key, 'key must be non-empty')
    assert(times, 'times must be non-empty')
    assert(expires, 'expires must be non-empty')
    const incr = await this.incr(name, key, expires)
    if (incr > times) {
      throw new Error('exceed the limit')
    }
  }
}
