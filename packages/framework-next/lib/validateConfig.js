const validateJsonSchema = require('@galenjs/factories/validateJsonSchema')

module.exports = async config => {
  await validateJsonSchema(config, {
    type: 'object',
    properties: {
      port: { type: 'number' },
      plugins: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            path: { type: 'string' },
            name: { type: 'string' }
          },
          required: ['path', 'name']
        }
      },
      workspace: { type: 'string' },
      modelDefPath: { type: 'string' },
      modelPath: { type: 'string' },
      models: {
        main: {
          dataSource: { type: 'string', enum: ['sequelize', 'virtual'] },
          options: {
            type: 'object'
          }
        }
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
    required: ['port']
  })
}
