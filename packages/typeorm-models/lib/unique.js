const _ = require('lodash')

module.exports = ({ tableName, properties, indexes = {} }) => {
  const keyUniques = Object.entries(properties).reduce((acc, [key, value]) => {
    if (!value.unique) {
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
  const indexUniques = Object.entries(indexes).reduce((acc, [key, value]) => {
    if (value.type !== 'unique') {
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
    ...keyUniques,
    ...indexUniques
  ]
}
