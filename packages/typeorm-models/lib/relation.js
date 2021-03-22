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
  .reduce((acc, [key, value]) => {
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
    if (value.foreignKey) {
      relationOptions.joinColumn = {
        name: value.foreignKey || `${_.snakeCase(value.model)}_id`
      }
    }
    if (['hasOne', 'hasMany'].includes(value.type)) {
      if (!value.through) {
        relationOptions.joinTable = {
          name: _.snakeCase(value.model),
          joinColumn: {
            name: value.primaryKey || `${_.snakeCase(value.model)}_id`
          }
        }
      } else {
        relationOptions.joinTable = {
          name: _.snakeCase(value.through),
          joinColumn: {
            name: `${key}_id`
          },
          joinTable: {
            name: _.snakeCase(value.model || value.keyThrough),
            type: 'one-to-one',
            joinColumn: {
              name: value.primaryKey || `${_.snakeCase(value.model)}_id`
            }
          }
        }
      }
    }
    return {
      ...acc,
      [key]: relationOptions
    }
  }, {})
