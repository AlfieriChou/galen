const Influx = require('influx')
const assert = require('assert')

const createModel = require('./lib/model')

module.exports = async (modelSchemas, {
  host, database
}) => {
  assert(host, '[influx] host is required')
  assert(database, '[influx] database is required')
  const schemas = modelSchemas.reduce((acc, schema) => {
    if (schema.dialect === 'influx') {
      return [...acc, createModel({
        tags: [],
        ...schema
      })]
    }
    return acc
  }, [])
  const influxClient = new Influx.InfluxDB({
    host,
    database,
    schema: schemas
  })
  const dbNames = await influxClient.getDatabaseNames()
  if (!dbNames.includes(database)) {
    await influxClient.createDatabase(database)
  }
  return influxClient
}
