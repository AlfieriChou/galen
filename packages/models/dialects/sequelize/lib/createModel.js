const { parseModelProperties } = require('./common')

module.exports = async (dataSource, {
  modelDef: {
    properties, modelName, tableName, plugins
  }
}) => {
  const options = {
    ...plugins,
    underscored: true,
    tableName
  }
  // indexes
  const indexes = Object.keys(properties).reduce((acc, key) => {
    // TODO: index
    // if (properties[key].index) {
    //   return [...acc, {}]
    // }
    if (properties[key].unique) {
      return [...acc, {
        unique: true,
        fields: [key]
      }]
    }
    // TODO: full_text
    return acc
  }, [])
  if (indexes.length) {
    options.indexes = indexes
  }
  return dataSource.define(modelName, parseModelProperties(properties), options)
}