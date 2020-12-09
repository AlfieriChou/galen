const { jsonToModel } = require('./common')

module.exports = ({
  model, modelName, tableName, plugins
}, sequelize) => {
  const options = {
    ...plugins,
    underscored: true,
    tableName
  }
  // indexes
  const indexes = Object.keys(model).reduce((acc, key) => {
    // TODO: index
    // if (model[key].index) {
    //   return [...acc, {}]
    // }
    if (model[key].unique) {
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
  return sequelize.define(modelName, jsonToModel(model), options)
}
