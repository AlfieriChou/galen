const validateJsonSchema = require('@galenjs/factories/validateJsonSchema')

module.exports = async config => {
  await validateJsonSchema(config, {
    type: 'object',
    properties: {
      port: { type: 'number' },
      plugin: {
        type: 'object',
        properties: {
          mainPath: { type: 'string' },
          plugins: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1
          }
        },
        required: ['plugins']
      },
      workspace: { type: 'string' },
      modelPath: { type: 'string' },
      sequelize: {
        type: 'object',
        properties: {
          default: {
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
          },
          clients: {
            type: 'object'
          }
        },
        required: ['default', 'clients']
      },
      redis: {
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
      },
      influx: {
        type: 'object',
        properties: {
          host: { type: 'string' },
          database: { type: 'string' }
        },
        required: ['host', 'database']
      },
      controllerPath: { type: 'string' },
      servicePath: { type: 'string' },
      middlewarePath: { type: 'string' },
      cors: {
        type: 'object',
        properties: {
          origin: { type: 'string' },
          maxAge: { type: 'number' },
          allowMethods: { type: 'string' },
          allowHeaders: { type: 'string' }
        }
      }
    },
    required: ['port', 'workspace', 'modelPath']
  })
}
