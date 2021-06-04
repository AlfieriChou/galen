const _ = require('lodash')
const validateSchema = require('@galenjs/factories/validateJsonSchema')

module.exports = async ({
  indexes, tableName
}, sequelize, queryInterface) => {
  const [existIndexes] = await sequelize.query(`show index from ${tableName};`)
  await Object.keys(indexes).reduce(async (promise, key) => {
    await promise
    const index = existIndexes.find(item => item.Key_name === key)
    if (index) {
      return
    }
    await validateSchema(indexes[key], {
      type: 'object',
      properties: {
        fields: { type: 'array', items: { type: 'string' } },
        type: { type: 'string', enum: ['index', 'unique'] }
      },
      required: ['fields', 'type']
    }, {
      extendErr: 'indexes'
    })
    if (indexes[key].type === 'unique') {
      await queryInterface.addIndex(
        tableName,
        indexes[key].fields.map(field => _.snakeCase(field)),
        {
          name: key,
          type: _.toUpper(indexes[key].type)
        }
      )
    }
    if (indexes[key].type === 'index') {
      await queryInterface.addIndex(
        tableName,
        indexes[key].fields.map(field => _.snakeCase(field)),
        {
          name: key
        }
      )
    }
  }, Promise.resolve())
}
