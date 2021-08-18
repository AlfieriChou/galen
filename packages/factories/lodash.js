const _ = require('lodash')

const camelJsonKeys = value => {
  if (Array.isArray(value)) {
    return value.map(v => camelJsonKeys(v))
  }
  if (value && value instanceof Object) {
    return Object.keys(value)
      .reduce((result, key) => ({
        ...result,
        [_.camelCase(key)]: camelJsonKeys(value[key])
      }), {})
  }
  return value
}

const snakeJsonKeys = value => {
  if (Array.isArray(value)) {
    return value.map(v => snakeJsonKeys(v))
  }
  if (value && value instanceof Object) {
    return Object.keys(value)
      .reduce((result, key) => ({
        ...result,
        [_.snakeCase(key)]: snakeJsonKeys(value[key])
      }), {})
  }
  return value
}

module.exports = {
  camelJsonKeys,
  snakeJsonKeys
}
