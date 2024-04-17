const _ = require('lodash')
const assert = require('assert')

const {
  parseModelProperties,
  getColumnInfo
} = require('./common')

// TODO add cache
const getTableNames = async queryInterface => queryInterface.showAllTables()
const getTableInfo = async (tableName, queryInterface) => queryInterface.describeTable(tableName)

const checkTableProperties = async ({
  tableName, tableInfo, properties
}) => {
  const fields = Object.keys(properties)
  fields.forEach(field => {
    assert(tableInfo[_.snakeCase(field)], `${tableName} ${field} column is not migrated`)
  })
}

const checkTableIsAddColumn = async (queryInterface, {
  tableName, tableInfo, properties
}) => {
  for (const key in properties) {
    const column = tableInfo[_.snakeCase(key)]
    if (!column) {
      await queryInterface.addColumn(
        tableName,
        _.snakeCase(key),
        getColumnInfo(key, properties[key])
      )
    }
  }
}

module.exports = async (dataSource, {
  modelDef: { tableName, stable },
  jsonSchema: { properties }
}) => {
  const queryInterface = dataSource.getQueryInterface()
  const allTableNames = await getTableNames(queryInterface)
  if (!allTableNames.includes(tableName)) {
    await queryInterface.createTable(
      tableName,
      await parseModelProperties(properties, _.snakeCase)
    )
    return
  }
  const tableInfo = await getTableInfo(tableName, queryInterface)
  if (stable) {
    await checkTableProperties({
      tableName, tableInfo, properties
    })
    return
  }
  await checkTableIsAddColumn(queryInterface, {
    tableName, tableInfo, properties
  })
}
