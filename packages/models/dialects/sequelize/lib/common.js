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
  json: Sequelize.TEXT('long'),
  object: Sequelize.TEXT('long'),
  array: Sequelize.TEXT('long')
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
        return JSON.parse(this.getDataValue(field))
      }
      columnInfo.set = function (data) {
        this.setDataValue(data, JSON.stringify(data))
      }
    }
    if (value.hidden) {
      columnInfo.get = function () {
        return null
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
