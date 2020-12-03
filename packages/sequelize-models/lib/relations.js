const assert = require('assert')

module.exports = ({ modelName, relations }, models) => {
  Object.entries(relations).forEach(([key, value]) => {
    const options = {
      as: key
    }
    if (value.foreignKey) {
      options.foreignKey = value.foreignKey
    }
    if (value.primaryKey) {
      options.otherKey = value.primaryKey
    }
    if (!['belongsTo', 'hasOne', 'hasMany', 'belongsToMany'].includes(value.type)) {
      throw new Error('invalid associate!')
    }
    if (['belongsToMany', 'hasMany'].includes(value.type)) {
      assert(value.through, 'through is required!')
      options.through = value.through
    }
    models[modelName][value.type](models[value.model], options)
  })
  return models
}
