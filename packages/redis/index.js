const validateSchema = require('@galenjs/factories/validateJsonSchema')

const RedisService = require('./lib/redis')

const schema = {
  type: 'object',
  properties: {
    default: {
      type: 'object',
      properties: {
        host: { type: 'string' },
        port: { type: 'number' },
        password: { type: 'string' },
        db: { type: 'number' },
        keyPrefix: { type: 'string' }
      }
    },
    clients: {
      type: 'object'
    }
  },
  required: ['default', 'clients']
}

module.exports = async options => {
  await validateSchema(options, schema, {
    extendErr: '[@galenjs/redis]: '
  })
  return new RedisService(options)
}
