const _ = require('lodash')
const validateSchema = require('@galenjs/func/validateJsonSchema')

const relationTypes = {
  belongsTo: 'one-to-one',
  belongsToMany: 'one-to-many',
  hasMany: 'many-to-many',
  hasOne: 'many-to-one'
}

module.exports = ({
  relations = {}
}) => Object.entries(relations)
  .reduce(async (acc, [key, value]) => {
    validateSchema(value, {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['belongsTo', 'hasOne', 'hasMany', 'belongsToMany'] },
        model: { type: 'string' },
        through: { type: 'string' },
        primaryKey: { type: 'string' },
        foreignKey: { type: 'string' }
      },
      required: ['type', 'model']
    }, { extendErr: '[@galenjs/typeorm-model] relations' })
    const relationOptions = {
      type: relationTypes[value.type],
      target: _.snakeCase(value.model)
    }
    // TODO: joinTable joinColumn
    return {
      ...acc,
      [key]: relationOptions
    }
  }, {})
