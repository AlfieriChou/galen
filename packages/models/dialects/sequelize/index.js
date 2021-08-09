const { Sequelize, Model } = require('sequelize')
const createBaseModel = require('../../lib/baseModel')
const parseModel = require('./lib/parseModel')

exports.createDataSource = options => new Sequelize(options)

exports.createModel = (dataSource, { modelDef, jsonSchema }, createModelFunc) => {
  const BaseModel = createBaseModel(Model, dataSource, { modelDef, jsonSchema })
  const model = createModelFunc ? createModelFunc(BaseModel) : BaseModel
  model.init(
    parseModel(modelDef.properties),
    {
      sequelize: dataSource,
      modelName: modelDef.modelName,
      underscored: true,
      ...(modelDef.plugins || {})
    }
  )
  return model
}
