const _ = require('lodash')

module.exports = ({ tableName, properties, indexes = {} }) => {
  const keyIndices = Object.entries(properties).reduce((acc, [key, value]) => {
    if (!value.index) {
      return acc
    }
    return [
      ...acc,
      {
        name: `${tableName}_${_.snakeCase(key)}`,
        columns: [_.snakeCase(key)]
      }
    ]
  }, [])
  const indexIndices = Object.entries(indexes).reduce((acc, [key, value]) => {
    if (value.type !== 'index') {
      return acc
    }
    return [
      ...acc,
      {
        name: key,
        columns: value.fields.map(field => _.snakeCase(field))
      }
    ]
  }, [])
  return [
    ...keyIndices,
    ...indexIndices
  ]
}
