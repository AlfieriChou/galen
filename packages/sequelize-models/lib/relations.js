const assert = require('assert')
const validateSchema = require('./validateSchema')

module.exports = async ({ modelName, relations }, models) => {
  Object.entries(relations).reduce(async (promise, [key, value]) => {
    await promise
    await validateSchema(value, {
      type: 'object',
      properties: {
        type: { type: 'string' },
        model: { type: 'string', enum: ['belongsTo', 'hasOne', 'hasMany', 'belongsToMany'] },
        through: { type: 'string' },
        primaryKey: { type: 'string' },
        foreignKey: { type: 'string' }
      },
      required: ['type', 'model']
    }, { extendErr: 'relations' })
    const options = {
      as: key
    }
    if (value.foreignKey) {
      options.foreignKey = value.foreignKey
    }
    if (value.primaryKey) {
      options.otherKey = value.primaryKey
    }
    if (['belongsToMany', 'hasMany'].includes(value.type)) {
      assert(value.through, 'through is required!')
      options.through = value.through
    }
    models[modelName][value.type](models[value.model], options)
  }, Promise.resolve())
  return models
}
