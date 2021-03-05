const Sequelize = require('sequelize')

const validateSchema = require('./lib/validateSchema')
const createModel = require('./lib/createModel')
const buildRelations = require('./lib/relations')
const migrateModel = require('./lib/migrate')
const createIndex = require('./lib/createIndex')

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

module.exports = async (schemas, {
  clients = {
    main: {}
  },
  ...mysqlOptions
}) => {
  await validateSchema(mysqlOptions.default, {
    type: 'object',
    properties: {
      host: { type: 'string' },
      database: { type: 'string' },
      user: { type: 'string' },
      password: { type: 'string' },
      debug: { type: 'boolean' },
      pool: {
        type: 'object',
        properties: {
          min: { type: 'integer' },
          max: { type: 'integer' }
        }
      }
    },
    required: ['host', 'database', 'user', 'password']
  })

  const instances = new Map(Object
    .entries(clients)
    .reduce((acc, [key, value]) => ([
      ...acc,
      [
        key,
        createSequelize({
          ...mysqlOptions.default,
          ...value
        })
      ]
    ]), []))

  const db = await Object.entries(schemas).reduce((ret, [modelName, schema]) => {
    if (schema.dialect !== 'mysql') {
      return ret
    }
    const sequelize = instances.get(schema.databaseName || 'main')
    return {
      ...ret,
      [modelName]: createModel(schema, sequelize)
    }
  }, {})

  // 必须要阻塞启动
  await Object.entries(schemas).reduce(async (promise, [, modelInst]) => {
    await promise
    if (modelInst.dialect !== 'mysql') {
      return
    }
    const sequelize = instances.get(modelInst.databaseName || 'main')
    const queryInterface = sequelize.getQueryInterface()
    await migrateModel(modelInst, queryInterface, schemas)
    if (modelInst.relations) {
      await buildRelations(modelInst, db)
    }
    if (modelInst.indexes) {
      await createIndex(modelInst, sequelize, queryInterface)
    }
  }, Promise.resolve())
  db.select = name => instances.get(name)
  db.Sequelize = Sequelize
  db.quit = async (log) => {
    const logger = log || console
    await [...instances.keys()]
      .reduce(async (promise, key) => {
        await promise
        logger.info('[@galenjs/sequelize-models] ', key, 'start close')
        await instances.get(key).close()
        logger.info('[@galenjs/sequelize-models] ', key, 'close done')
      }, Promise.resolve())
  }
  return db
}
