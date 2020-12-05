const _ = require('lodash')
const { jsonToModel, sequelizeTypes } = require('./common')

// TODO add cache
const getTableNames = async sequelize => sequelize.showAllTables()
const getTableInfo = async (tableName, sequelize) => sequelize.describeTable(tableName)

module.exports = async ({
  model, tableName, relations
  // eslint-disable-next-line consistent-return
}, sequelize, schemas) => {
  const migrateModel = {
    id: {
      type: 'integer',
      autoIncrement: true,
      primaryKey: true
    },
    ...model,
    ...Object.entries(relations || {})
      .reduce((acc, [key, relation]) => {
        if (relation.type !== 'belongsTo') {
          return acc
        }
        const schema = schemas[relation.model]
        return {
          ...acc,
          [`${key}Id`]: {
            type: schema.model.id.type,
            description: `关联${relation.model}`
          }
        }
      }, {})
  }

  const allTableNames = await getTableNames(sequelize)
  if (!allTableNames.includes(tableName)) {
    return sequelize.createTable(tableName, jsonToModel(migrateModel, _.snakeCase))
  }
  // change table columns properties
  const tableInfo = await getTableInfo(tableName, sequelize)
  // eslint-disable-next-line consistent-return
  await Object.entries(migrateModel).reduce(async (promise, [key, value]) => {
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
