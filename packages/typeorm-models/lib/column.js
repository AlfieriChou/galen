const typeEnum = {
  string: String,
  number: Number,
  integer: 'int',
  boolean: Boolean
}

module.exports = properties => Object.entries(properties)
  .reduce((acc, [key, value]) => ({
    ...acc,
    [key]: {
      ...value,
      type: typeEnum[value.type] || value.type
    }
  }), {})
