const { jsonToModel } = require('./common')

module.exports = ({
  model, modelName, tableName, plugins
}, sequelize) => sequelize.define(modelName, jsonToModel(model), {
  ...plugins,
  underscored: true,
  tableName
})
