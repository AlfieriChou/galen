const { Sequelize, Model } = require('sequelize')
const validateSchema = require('@galenjs/factories/validateJsonSchema')

exports.connection = async (options) => {
  await validateSchema(options, {
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

exports.buildModel = ({
  tableName, jsonSchema, modelSchema, remoteMethods
}) => class extends Model {
  static get tableName () {
    return tableName
  }

  static get jsonSchema () {
    return jsonSchema
  }

  static get modelSchema () {
    return modelSchema
  }

  static get remoteMethods () {
    return remoteMethods
  }
}
