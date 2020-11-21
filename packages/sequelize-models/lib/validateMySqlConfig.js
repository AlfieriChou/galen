const { Validator } = require('jsonschema')

const v = new Validator()

const mysqlConfigSchema = {
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
}

module.exports = async (config) => {
  const ret = await v.validate(config, mysqlConfigSchema)
  if (ret.errors.length > 0) {
    const errMsg = ret.errors.reduce((acc, error, index) => ([
      ...acc,
      `${index + 1}: ${error.message}`
    ]), []).join()
    throw new Error(errMsg)
  }
}
