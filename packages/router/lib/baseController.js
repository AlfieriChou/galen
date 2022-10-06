const sequelizeQueryFilter = require('@galenjs/sequelize-query-filter')
const influxQueryFilter = require('@galenjs/influx-query-filter')
const _ = require('lodash')

module.exports = class BaseController {
  static async index (modelName, modelSchema, ctx) {
    const { request: { query } } = ctx
    if (modelSchema.dialect === 'influx') {
      const list = await ctx.influx.query(influxQueryFilter({
        filter: query,
        ...modelSchema
      }))
      return {
        total: list.length,
        list
      }
    }
    const filter = sequelizeQueryFilter({
      query, modelName
    }, ctx.models, ctx.modelDefs)
    return {
      total: await ctx.models[modelName].count(filter),
      list: await ctx.models[modelName].findAll(filter)
    }
  }

  static async create (modelName, modelSchema, ctx) {
    const { request: { body } } = ctx
    if (modelSchema.dialect === 'influx') {
      try {
        await ctx.influx.writePoints([{
          measurement: modelSchema.tableName,
          tags: _.pick(body, modelSchema.tags || []),
          fields: _.omit(body, modelSchema.tags || [])
        }])
        return { success: true }
      } catch (err) {
        ctx.throw(400, '数据写入失败')
      }
    }
    return ctx.models[modelName].create(body)
  }

  static async show (modelName, _modelSchema, ctx) {
    const { params: { id } } = ctx
    return ctx.models[modelName].findByPk(id)
  }

  static async update (modelName, _modelSchema, ctx) {
    const { request: { body }, params: { id } } = ctx
    return ctx.models[modelName].update(body, { where: { id } })
  }

  static async destroy (modelName, _modelSchema, ctx) {
    const { params: { id } } = ctx
    return ctx.models[modelName].destroy({ where: { id } })
  }
}
