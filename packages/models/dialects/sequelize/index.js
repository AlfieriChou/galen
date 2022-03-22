const { Sequelize } = require('sequelize')
const assert = require('assert')

const createIndex = require('./lib/createIndex')
const migrateTable = require('./lib/migrate')
const createDefaultModel = require('./lib/createModel')
const createBaseModel = require('../../lib/baseModel')
const createCrudModel = require('./lib/crudModel')

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
    logging: false,
    define: {
      charset: 'utf8',
      dialectOptions: {
        collate: 'utf8_general_ci'
      }
    }
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

exports.createModel = async (dataSource, { modelDef, jsonSchema }) => {
  await createDefaultModel(
    dataSource,
    { modelDef }
  )
  const Model = dataSource.models[modelDef.modelName]
  const BaseModel = createBaseModel(Model, dataSource, { modelDef, jsonSchema })
  return createCrudModel(BaseModel)
}

exports.migrate = async (dataSource, { modelDef, jsonSchema }) => {
  if (modelDef.stable) {
    return
  }
  await migrateTable(dataSource, { modelDef, jsonSchema })
  await createIndex(dataSource, modelDef)
}

exports.createRelations = async (models, { modelName, relations }) => {
  if (!relations) {
    return
  }
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
}
