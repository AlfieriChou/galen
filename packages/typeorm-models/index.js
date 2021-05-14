const { createConnection } = require('typeorm')
const validateSchema = require('@galenjs/factories/validateJsonSchema')

const createEntity = require('./lib/entity')

const createClient = async (entities, options) => createConnection({
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  entities,
  synchronize: true,
  logging: false,
  ...options
})

module.exports = async (schemas, {
  clients = {
    main: {}
  },
  ...typeOrmOptions
}) => {
  await validateSchema(typeOrmOptions.default, {
    type: 'object',
    properties: {
      host: { type: 'string' },
      port: { type: 'number' },
      database: { type: 'string' },
      username: { type: 'string' },
      password: { type: 'string' },
      logging: { type: 'boolean' },
      synchronize: { type: 'boolean' }
    },
    required: ['host', 'database', 'username', 'password']
  })
  const models = {}
  const clientsEntities = Object.entries(schemas).reduce((acc, [key, value]) => {
    if (value.dialect !== 'mysql') {
      return acc
    }
    const clientName = value.databaseName || 'main'
    const entities = acc[clientName] || []
    models[key] = createEntity(value)
    return {
      [clientName]: [...entities, models[key]]
    }
  }, {})
  const connectionInstances = await Object.keys(clients)
    .reduce(async (promise, clientName) => {
      const acc = await promise
      return [
        ...acc,
        [
          clientName,
          (await createClient(clientsEntities[clientName] || [], {
            ...typeOrmOptions.default,
            ...clients[clientName]
          }))
        ]
      ]
    }, Promise.resolve([]))
  return {
    models,
    connections: new Map(connectionInstances)
  }
}
