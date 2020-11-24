const Sequelize = require('sequelize')

const validateMySqlConfig = require('./lib/validateMySqlConfig')
const createModel = require('./lib/createModel')
const buildRelations = require('./lib/relations')
const migrateModel = require('./lib/migrate')

const createSequelize = (options) => {
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

module.exports = async (schemas, { mysql }) => {
  await validateMySqlConfig(mysql)
  const sequelize = createSequelize(mysql)

  const db = await Object.entries(schemas).reduce((ret, [modelName, schema]) => {
    if (schema.dialect === 'virtual') {
      return ret
    }
    return {
      ...ret,
      [modelName]: createModel(schema, sequelize)
    }
  }, {})
  Object.entries(schemas).forEach(([, modelInst]) => {
    if (modelInst.dialect !== 'virtual') {
      migrateModel(modelInst, sequelize.getQueryInterface(), schemas)
    }
    if (modelInst.dialect !== 'virtual' && modelInst.relations) {
      buildRelations(modelInst, db)
    }
  })
  db.sequelize = sequelize
  db.Sequelize = Sequelize
  return db
}
