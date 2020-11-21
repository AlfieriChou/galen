const _ = require('lodash')

const BaseController = require('./baseController')

const camelObjKeys = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(v => camelObjKeys(v))
  }
  if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj)
      .reduce((result, key) => ({
        ...result,
        [_.camelCase(key)]: camelObjKeys(obj[key])
      }), {})
  }
  return obj
}

exports.camelObjKeys = camelObjKeys

exports.intersection = (a, b) => {
  const s = new Set(b)
  return a.filter(x => s.has(x))
}

exports.BaseController = BaseController
