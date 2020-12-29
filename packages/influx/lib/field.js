const Influx = require('influx')

const fieldTypeMap = {
  string: Influx.FieldType.STRING,
  integer: Influx.FieldType.INTEGER,
  float: Influx.FieldType.FLOAT,
  boolean: Influx.FieldType.BOOLEAN
}

module.exports = props => Object.entries(props).reduce((ret, [key, value]) => {
  if (!fieldTypeMap[value.type]) {
    throw new Error(`Invalid field type: ${value.type}`)
  }
  return {
    ...ret,
    [key]: fieldTypeMap[value.type]
  }
}, {})
