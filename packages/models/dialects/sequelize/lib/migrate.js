const _ = require('lodash')
const { DataTypes } = require('@sequelize/core')

const { parseModelProperties, sequelizeTypes } = require('./common')

// TODO add cache
const getTableNames = async queryInterface => queryInterface.showAllTables()
const getTableInfo = async (tableName, queryInterface) => queryInterface.describeTable(tableName)

module.exports = async (dataSource, {
  modelDef: { tableName },
  jsonSchema: { properties }
  // eslint-disable-next-line consistent-return
}) => {
  const queryInterface = dataSource.getQueryInterface()
  const allTableNames = await getTableNames(queryInterface)
  if (!allTableNames.includes(tableName)) {
    return queryInterface.createTable(
      tableName,
      parseModelProperties(properties, _.snakeCase)
    )
  }
  // change table columns properties
  const tableInfo = await getTableInfo(tableName, queryInterface)
  // eslint-disable-next-line consistent-return
  await Object.entries(properties).reduce(async (promise, [key, value]) => {
    await promise
    // no column create column
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
        || value.default === false
        || value.default === 0
        || value.default === ''
      ) {
        columnInfo.defaultValue = value.default
      }
      if (value.description) {
        columnInfo.comment = value.description
      }
      return queryInterface.addColumn(tableName, _.snakeCase(key), columnInfo)
    }
    // TODO modify field properties
  }, Promise.resolve())
}
