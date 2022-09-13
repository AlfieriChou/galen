const _ = require('lodash')
const { DataTypes } = require('@sequelize/core')
const assert = require('assert')

const { parseModelProperties, sequelizeTypes } = require('./common')

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

const batchAddColumns = async (queryInterface, {
  tableName, tableInfo, properties
}) => {
  await Object.entries(properties)
    .reduce(async (promise, [key, value]) => {
      await promise
      const column = tableInfo[_.snakeCase(key)]
      if (!column) {
        const columnInfo = {
          ...value,
          type: sequelizeTypes[value.type]
        }
        if (value.type === 'string' && value.length) {
          columnInfo.type = DataTypes.STRING(value.length)
        }
        if (
          value.default
          || ['', 0, false].includes(value.default)
        ) {
          columnInfo.defaultValue = value.default
        }
        if (value.description) {
          columnInfo.comment = value.description
        }
        await queryInterface.addColumn(tableName, _.snakeCase(key), columnInfo)
      }
      // TODO modify field properties
    }, Promise.resolve())
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
      parseModelProperties(properties, _.snakeCase)
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
  await batchAddColumns(queryInterface, {
    tableName, tableInfo, properties
  })
}
