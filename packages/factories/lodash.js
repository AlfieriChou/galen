const _ = require('lodash')

const camelJsonKeys = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(v => camelJsonKeys(v))
  }
  if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj)
      .reduce((result, key) => ({
        ...result,
        [_.camelCase(key)]: camelJsonKeys(obj[key])
      }), {})
  }
  return obj
}

const snakeJsonKeys = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(v => snakeJsonKeys(v))
  }
  if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj)
      .reduce((result, key) => ({
        ...result,
        [_.snakeCase(key)]: snakeJsonKeys(obj[key])
      }), {})
  }
  return obj
}

module.exports = {
  camelJsonKeys,
  snakeJsonKeys
}
