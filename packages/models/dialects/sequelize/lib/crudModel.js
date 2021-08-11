const sequelizeQueryFilter = require('@galenjs/sequelize-query-filter')

module.exports = Model => {
  return class extends Model {
    static async index (ctx) {
      const { request: { query } } = ctx
      const filter = sequelizeQueryFilter(query, ctx.models)
      const [total, list] = await Promise.all([
        await this.count(filter),
        await this.findAll(filter)
      ])
      return {
        list,
        pageInfo: {
          totalNumber: total,
          page: (filter.offset + filter.limit) / filter.limit,
          pageSize: filter.limit,
          totalPage: Math.ceil(total / filter.limit)
        }
      }
    }

    static async create (ctx) {
      const { request: { body } } = ctx
      return this.create(body)
    }

    static async show (ctx) {
      const { params: { id } } = ctx
      return this.findByPk(id)
    }

    static async update (ctx) {
      const { request: { body }, params: { id } } = ctx
      return this.update(body, { where: { id } })
    }

    static async destroy (ctx) {
      const { params: { id } } = ctx
      return this.destroy({ where: { id } })
    }
  }
}
