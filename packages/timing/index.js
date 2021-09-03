const assert = require('assert')

const MAP = Symbol('Timing#map')
const LIST = Symbol('Timing#list')

module.exports = class Timing {
  constructor () {
    this.enable = true
    this[MAP] = new Map()
    this[LIST] = []

    this.init()
  }

  init () {
    this.start('Process Start', Date.now() - Math.floor((process.uptime() * 1000)))
    this.end('Process Start')

    if (typeof process.scriptStartTime === 'number') {
      this.start('Script Start', process.scriptStartTime)
      this.end('Script Start')
    }
  }

  start (name, start) {
    if (!name || !this.enable) return

    if (this[MAP].has(name)) this.end(name)

    const startAt = start || Date.now()
    const item = {
      name,
      start: startAt,
      end: undefined,
      duration: undefined,
      pid: process.pid,
      index: this[LIST].length
    }
    this[MAP].set(name, item)
    this[LIST].push(item)
    // eslint-disable-next-line consistent-return
    return item
  }

  end (name) {
    if (!name || !this.enable) return
    assert(this[MAP].has(name), `should run timing.start('${name}') first`)

    const item = this[MAP].get(name)
    item.end = Date.now()
    item.duration = item.end - item.start
    // eslint-disable-next-line consistent-return
    return item
  }

  enable () {
    this.enable = true
  }

  disable () {
    this.enable = false
  }

  clear () {
    this[MAP].clear()
    this[LIST] = []
  }

  toJSON () {
    return this[LIST]
  }
}
