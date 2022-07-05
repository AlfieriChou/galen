const { DataTypes } = require('@sequelize/core')

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
  json: DataTypes.TEXT('long'),
  object: DataTypes.TEXT('long'),
  array: DataTypes.TEXT('long')
}

const parseModelProperties = (properties, keyFn) => Object.entries(properties)
  .reduce((ret, [field, value]) => {
    const key = keyFn ? keyFn(field) : field
    const columnInfo = {
      ...value,
      type: sequelizeTypes[value.type]
    }
    if (value.type === 'string' && value.length) {
      columnInfo.type = DataTypes.STRING(value.length)
    }
    if (value.default) {
      columnInfo.defaultValue = value.default
    }
    if (value.description) {
      columnInfo.comment = value.description
    }
    if (value.type === 'date') {
      columnInfo.get = function () {
        const date = this.getDataValue(field)
        return date ? date.getTime() : 0
      }
      columnInfo.set = function (date) {
        this.setDataValue(field, date instanceof Date ? date : new Date(date))
      }
    }
    if (['json', 'object', 'array'].includes(value.type)) {
      columnInfo.get = function () {
        return this.getDataValue(field) ? JSON.parse(
          this.getDataValue(field)
        ) : this.getDataValue(field)
      }
      columnInfo.set = function (data) {
        if (data) {
          this.setDataValue(field, JSON.stringify(data))
        }
      }
    }
    return {
      ...ret,
      [key]: columnInfo
    }
  }, {})

module.exports = {
  sequelizeTypes, parseModelProperties
}
