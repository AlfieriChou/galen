const Sequelize = require('sequelize')
const assert = require('assert')

const createIndex = require('./lib/createIndex')
const migrateTable = require('./lib/migrate')
const createModel = require('./lib/createModel')
const createBaseModel = require('../../lib/baseModel')

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
  const Model = createModel(
    dataSource,
    { modelDef }
  )
  const BaseModel = createBaseModel(Model, dataSource, { modelDef, jsonSchema })
  const model = createModelFunc ? createModelFunc(BaseModel) : BaseModel
  return model
}

exports.migrate = async (dataSource, { modelDef, jsonSchema }) => {
  if (modelDef.stable) {
    return
  }
  await migrateTable(dataSource, { modelDef, jsonSchema })
  await createIndex(dataSource, modelDef)
}

exports.createRelations = async (models, { modelName, relations }) => {
  await Object.entries(relations).reduce(async (promise, [key, value]) => {
    await promise
    const options = {
      as: key
    }
    if (value.foreignKey) {
      options.foreignKey = value.foreignKey
    }
    if (value.primaryKey) {
      options.otherKey = value.primaryKey
    }
    if (['belongsToMany', 'hasMany'].includes(value.type)) {
      assert(value.through, 'through is required!')
      options.through = value.through
    }
    models[modelName][value.type](models[value.model], options)
  }, Promise.resolve())
  return models
}
