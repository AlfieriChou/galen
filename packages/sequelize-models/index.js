const Sequelize = require('sequelize')
const readDirFilenames = require('read-dir-filenames')
const _ = require('lodash')
const path = require('path')

const validateMySqlConfig = require('./lib/validateMySqlConfig')
const createModel = require('./lib/createModel')
const buildRelations = require('./lib/relations')
const buildCrudRemoteMethods = require('./lib/crudRemoteMethods')
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

module.exports = async (modelDirPath, { mysql }) => {
  await validateMySqlConfig(mysql)
  const sequelize = createSequelize(mysql)

  let remoteMethods = {}
  const modelSchemas = {}
  const schemas = {}

  const filepaths = readDirFilenames(modelDirPath, { ignore: 'index.js' })
  const db = await filepaths.reduce((ret, filepath) => {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const schema = require(filepath)
    const filename = path.basename(filepath).replace(/\.\w+$/, '')
    if (!schema.modelName) {
      schema.modelName = _.upperFirst(filename)
    }
    if (!schema.tableName) {
      schema.tableName = _.snakeCase(filename)
    }
    const { modelName, model } = schema
    const remoteMethod = buildCrudRemoteMethods(filename, schema)
    remoteMethods = {
      ...remoteMethods,
      ...Object.entries(remoteMethod).reduce((acc, [key, value]) => ({
        ...acc,
        [`${filename}-${key}`]: value
      }), {})
    }
    modelSchemas[modelName] = schema
    if (!schema.model) {
      return ret
    }
    schemas[modelName] = {
      type: 'object', properties: model
    }
    return {
      ...ret,
      [modelName]: createModel(schema, sequelize)
    }
  }, {})
  Object.entries(modelSchemas).forEach(([, modelInst]) => {
    if (modelInst.dialect !== 'virtual') {
      migrateModel(modelInst, sequelize.getQueryInterface(), schemas)
    }
    if (modelInst.dialect !== 'virtual' && modelInst.relations) {
      buildRelations(modelInst, db)
    }
  })
  db.sequelize = sequelize
  db.Sequelize = Sequelize
  return {
    db, remoteMethods, modelSchemas, schemas
  }
}
