const { DataTypes } = require('sequelize')

const sequelizeTypes = {
  integer: DataTypes.INTEGER,
  float: DataTypes.FLOAT,
  bigint: DataTypes.BIGINT,
  text: DataTypes.TEXT,
  decimal: DataTypes.DECIMAL,
  uuid: DataTypes.UUID,
  uuidv1: DataTypes.UUIDV1,
  uuidv4: DataTypes.UUIDV4,
  string: DataTypes.STRING,
  date: DataTypes.DATE,
  boolean: DataTypes.BOOLEAN,
  json: DataTypes.JSON,
  array: DataTypes.ARRAY
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
