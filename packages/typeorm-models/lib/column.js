const _ = require('lodash')

const typeEnum = {
  string: String,
  number: Number,
  integer: 'int',
  boolean: Boolean
}

module.exports = properties => Object.entries(properties)
  .reduce((acc, [key, value]) => ({
    ...acc,
    [_.snakeCase(key)]: {
      ...value,
      type: typeEnum[value.type] || value.type
    }
  }), {})
