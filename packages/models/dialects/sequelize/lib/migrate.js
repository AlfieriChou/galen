const _ = require('lodash')
const { parsedModelProperties, sequelizeTypes } = require('./common')

// TODO add cache
const getTableNames = async sequelize => sequelize.showAllTables()
const getTableInfo = async (tableName, sequelize) => sequelize.describeTable(tableName)

module.exports = async (sequelize, {
  modelDef: { tableName },
  jsonSchema
  // eslint-disable-next-line consistent-return
}) => {
  const allTableNames = await getTableNames(sequelize)
  if (!allTableNames.includes(tableName)) {
    return sequelize.createTable(tableName, parsedModelProperties(jsonSchema, _.snakeCase))
  }
  // change table columns properties
  const tableInfo = await getTableInfo(tableName, sequelize)
  // eslint-disable-next-line consistent-return
  await Object.entries(jsonSchema).reduce(async (promise, [key, value]) => {
    await promise
    // no column create column
    const column = tableInfo[_.snakeCase(key)]
    if (!column) {
      const columnInfo = {
        ...value,
        type: sequelizeTypes[value.type]
      }
      if (value.default) {
        columnInfo.defaultValue = value.default
      }
      if (value.description) {
        columnInfo.comment = value.description
      }
      return sequelize.addColumn(tableName, _.snakeCase(key), columnInfo)
    }
    // TODO modify field properties
  }, Promise.resolve())
}
