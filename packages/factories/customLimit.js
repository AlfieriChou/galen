module.exports = class CustomLimit {
  constructor () {
    this.cache = new Map()
  }

  clearAll () {
    this.cache.clear()
  }

  getValue (key) {
    return this.cache.get(key)
  }

  length () {
    return this.cache.size
  }

  async execute (key, fn) {
    const value = this.cache.get(key)
    if (value) {
      return value
    }
    this.clearAll()
    const ret = await fn()
    this.cache.set(key, ret)
    return ret
  }
}
