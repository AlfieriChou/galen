const Influx = require('influx')
const assert = require('assert')

const createModel = require('./lib/model')

module.exports = async (modelSchemas, {
  host, database
}) => {
  assert(host, '[influx] host is required')
  assert(database, '[influx] database is required')
  const schemas = Object.entries(modelSchemas)
    .reduce((acc, [_, schema]) => {
      if (schema.dialect === 'influx') {
        return [...acc, createModel({
          tags: [],
          ...schema
        })]
      }
      return acc
    }, [])
  const client = new Influx.InfluxDB({
    host,
    database,
    schema: schemas
  })
  const dbNames = await client.getDatabaseNames()
  if (!dbNames.includes(database)) {
    await client.createDatabase(database)
  }
  return client
}
