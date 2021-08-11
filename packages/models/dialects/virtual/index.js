const createBaseModel = require('../../lib/baseModel')
const createCrudModel = require('./lib/crudModel')

exports.createDataSource = options => options

exports.createModel = (dataSource, { modelDef, jsonSchema }, createModelFunc) => {
  const BaseModel = createBaseModel(class Model {}, dataSource, { modelDef, jsonSchema })
  const CrudModel = createCrudModel(BaseModel)
  const model = createModelFunc ? createModelFunc(CrudModel) : CrudModel
  return model
}

exports.migrate = async () => {}
