const sequelizeQueryFilter = require('@galenjs/sequelize-query-filter')

module.exports = Model => {
  return class extends Model {
    static $formatJson (json) {
      const { modelDef } = this
      Object.keys(json).forEach(key => {
        if (
          modelDef.properties[key]
          && modelDef.properties[key].type === 'date'
        ) {
          // eslint-disable-next-line no-param-reassign
          json[key] = json[key] ? json[key].getTime() : 0
        }
      })
      return json
    }

    static $parseJson (json) {
      const { modelDef } = this
      Object.keys(json).forEach(key => {
        if (
          modelDef.properties[key]
          && modelDef.properties[key].type === 'date'
          && json[key]
        ) {
          // eslint-disable-next-line no-param-reassign
          json[key] = json[key] instanceof Date ? json[key] : new Date(json[key])
        }
      })
      return json
    }

    static async remoteFindPage (ctx) {
      const { request: { query } } = ctx
      const filter = sequelizeQueryFilter(query, ctx.models)
      const [total, list] = await Promise.all([
        await this.count(filter),
        await this.findAll(filter)
      ])
      return {
        list: list.map(inst => this.$formatJson(inst.dataValues)),
        pageInfo: {
          totalNumber: total,
          page: (filter.offset + filter.limit) / filter.limit,
          pageSize: filter.limit,
          totalPage: Math.ceil(total / filter.limit)
        }
      }
    }

    static async remoteCreate (ctx) {
      const { request: { body } } = ctx
      const inst = await this.create(this.$parseJson(body))
      return this.$formatJson(inst.dataValues)
    }

    static async remoteShow (ctx) {
      const { params: { id } } = ctx
      const inst = await this.findByPk(id)
      return this.$formatJson(inst.dataValues)
    }

    static async remoteUpdate (ctx) {
      const { request: { body }, params: { id } } = ctx
      return this.update(body, { where: { id } })
    }

    static async remoteDestroy (ctx) {
      const { params: { id } } = ctx
      return this.destroy({ where: { id } })
    }
  }
}
