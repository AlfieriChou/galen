const sequelizeQueryFilter = require('@galenjs/sequelize-query-filter')

module.exports = class BaseController {
  static async index (modelName, _modelSchema, ctx) {
    const { request: { query } } = ctx
    // TODO: influx
    // if (modelSchema.dialect === 'influx') {

    // }
    const filter = sequelizeQueryFilter(query, ctx.models)
    return {
      total: await ctx.models[modelName].count(filter),
      list: await ctx.models[modelName].findAll(filter)
    }
  }

  static async create (modelName, _modelSchema, ctx) {
    const { request: { body } } = ctx
    // TODO: influx
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
