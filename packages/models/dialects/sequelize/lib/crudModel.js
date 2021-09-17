const sequelizeQueryFilter = require('@galenjs/sequelize-query-filter')

module.exports = Model => {
  return class extends Model {
    static $formatJson (json) {
      const { modelDef: { properties = {} } } = this
      Object.keys(json).forEach(key => {
        const property = properties[key]
        if (
          property
          && ['json', 'array'].includes(property.type)
        ) {
          // eslint-disable-next-line no-param-reassign
          json[key] = JSON.parse(json[key])
        }
        if (
          property
          && property.type === 'date'
        ) {
          // eslint-disable-next-line no-param-reassign
          json[key] = json[key] ? json[key].getTime() : 0
        }
        if (property && property.hidden) {
          // eslint-disable-next-line no-param-reassign
          delete json[key]
        }
      })
      return json
    }

    static $parseJson (json) {
      const { modelDef: { properties = {} } } = this
      Object.keys(json).forEach(key => {
        const property = properties[key]
        if (
          property
          && ['json', 'array'].includes(property.type)
        ) {
          // eslint-disable-next-line no-param-reassign
          json[key] = JSON.stringify(json[key])
        }
        if (
          property
          && property.type === 'date'
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
      return this.update(this.$parseJson(body), { where: { id } })
    }

    static async remoteDestroy (ctx) {
      const { params: { id } } = ctx
      return this.destroy({ where: { id } })
    }
  }
}
