const { DataTypes } = require('@sequelize/core')

const sequelizeTypes = {
  integer: () => DataTypes.INTEGER,
  float: () => DataTypes.FLOAT,
  bigint: () => DataTypes.BIGINT,
  text: () => DataTypes.TEXT,
  decimal: () => DataTypes.DECIMAL,
  uuid: () => DataTypes.UUID,
  uuidv1: () => DataTypes.UUIDV1,
  uuidv4: () => DataTypes.UUIDV4,
  string: (length = 255) => DataTypes.STRING(length),
  date: () => DataTypes.DATE,
  boolean: () => DataTypes.BOOLEAN,
  json: () => DataTypes.TEXT('long'),
  object: () => DataTypes.TEXT('long'),
  array: () => DataTypes.TEXT('long')
}

const getColumnInfo = (key, value) => {
  const columnInfo = value

  // 字段定义
  if (value.type === 'string') {
    columnInfo.type = sequelizeTypes.string(value?.length || 255)
  } else {
    const typeFn = sequelizeTypes[value.type]
    columnInfo.type = typeFn && typeFn()
  }

  // 默认枚举值注入
  if (
    value.default ||
    ['', 0, false].includes(value.default)
  ) {
    columnInfo.defaultValue = value.default
  }

  // 字段描述
  if (value.description) {
    columnInfo.comment = value.description
  }

  // 时间字段注入默认值
  if (value.type === 'date') {
    columnInfo.get = function () {
      const date = this.getDataValue(key)
      return date ? date.getTime() : 0
    }
    columnInfo.set = function (date) {
      this.setDataValue(key, date instanceof Date ? date : new Date(date))
    }
  }

  // object特殊处理
  if (['json', 'object', 'array'].includes(value.type)) {
    columnInfo.get = function () {
      return this.getDataValue(key)
        ? JSON.parse(
          this.getDataValue(key)
        )
        : this.getDataValue(key)
    }
    columnInfo.set = function (data) {
      if (data) {
        this.setDataValue(key, JSON.stringify(data))
      }
    }
  }

  return columnInfo
}

const parseModelProperties = async (properties, keyFn) => {
  return Object.entries(properties).reduce((ret, [key, value]) => {
    return {
      ...ret,
      [keyFn ? keyFn(key) : key]: getColumnInfo(key, value)
    }
  }, {})
}

module.exports = {
  sequelizeTypes,
  parseModelProperties,
  getColumnInfo
}
