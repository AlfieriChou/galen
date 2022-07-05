const { Model } = require('@sequelize/core')

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
  const model = class extends Model {
    // eslint-disable-next-line
    static name = tableName
  }
  return model.init(parseModelProperties(properties), {
    sequelize: dataSource,
    ...options
  })
}
