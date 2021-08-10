const Sequelize = require('sequelize')

const sequelizeTypes = {
  integer: Sequelize.INTEGER,
  float: Sequelize.FLOAT,
  bigint: Sequelize.BIGINT,
  text: Sequelize.TEXT,
  decimal: Sequelize.DECIMAL,
  uuid: Sequelize.UUID,
  uuidv1: Sequelize.UUIDV1,
  uuidv4: Sequelize.UUIDV4,
  string: Sequelize.STRING,
  date: Sequelize.DATE,
  boolean: Sequelize.BOOLEAN,
  json: Sequelize.JSON,
  array: Sequelize.ARRAY
}

const parseModelProperties = (properties, keyFn) => Object.entries(properties)
  .reduce((ret, [field, value]) => {
    const key = keyFn ? keyFn(field) : field
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
    return {
      ...ret,
      [key]: columnInfo
    }
  }, {})

module.exports = {
  sequelizeTypes, parseModelProperties
}
