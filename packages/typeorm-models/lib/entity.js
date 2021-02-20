const { EntitySchema } = require('typeorm')

const parseProperties = require('./column')
const createUniques = require('./unique')
const createIndices = require('./indices')

module.exports = (schema) => {
  const entityInfo = {
    name: schema.tableName,
    columns: parseProperties(schema.properties || {})
  }
  const uniques = createUniques(schema)
  if (uniques.length) {
    entityInfo.uniques = uniques
  }
  const indices = createIndices(schema)
  if (indices.length) {
    entityInfo.indices = indices
  }
  return new EntitySchema(entityInfo)
}
