module.exports = class BaseController {
  static async index (ctx, modelName) {
    const { request: { query } } = ctx
    // TODO: use sequelize query filter
    const filter = query
    return {
      count: await ctx.models[modelName].count(filter),
      offset: parseInt(query.offset, 10) || 0,
      limit: parseInt(query.limit, 10) || 10,
      data: await ctx.models[modelName].findAll(filter)
    }
  }

  static async create (ctx, modelName) {
    const { request: { body } } = ctx
    return ctx.models[modelName].create(body)
  }

  static async show (ctx, modelName) {
    const { params: { id } } = ctx
    return ctx.models[modelName].findByPk(id)
  }

  static async update (ctx, modelName) {
    const { request: { body }, params: { id } } = ctx
    return ctx.models[modelName].update(body, { where: { id } })
  }

  static async destroy (ctx, modelName) {
    const { params: { id } } = ctx
    return ctx.models[modelName].destroy({ where: { id } })
  }
}
