const { Sequelize, Model } = require('sequelize')
const createBaseModel = require('../../lib/baseModel')
const { parseModelProperties } = require('./lib/common')
const createIndex = require('./lib/createIndex')
const migrateTable = require('./lib/migrate')

exports.createDataSource = options => {
  const {
    database, user, password, host, port, pool, debug
  } = options
  const sequelizeOpts = {
    host,
    port: port || 3306,
    dialect: 'mysql',
    pool: {
      max: 10,
      min: 0,
      idle: 10000
    },
    logging: false
  }
  if (debug) {
    sequelizeOpts.logging = true
  }
  if (pool) {
    sequelizeOpts.pool = {
      max: pool.max,
      min: pool.min
    }
  }
  return new Sequelize(database, user, password, sequelizeOpts)
}

exports.createModel = (dataSource, { modelDef, jsonSchema }, createModelFunc) => {
  const BaseModel = createBaseModel(Model, dataSource, { modelDef, jsonSchema })
  const model = createModelFunc ? createModelFunc(BaseModel) : BaseModel
  model.init(
    parseModelProperties(modelDef.properties),
    {
      sequelize: dataSource,
      tableName: modelDef.tableName,
      modelName: modelDef.modelName,
      underscored: true,
      ...(modelDef.plugins || {})
    }
  )
  return model
}

exports.migrate = async (dataSource, { modelDef, jsonSchema }) => {
  if (modelDef.stable) {
    return
  }
  await migrateTable(dataSource, { modelDef, jsonSchema })
  await createIndex(dataSource, modelDef)
}
