const sequelizeQueryFilter = require('@galenjs/sequelize-query-filter')

module.exports = Model => {
  const parseJsonData = async data => {
    const { modelDef: { properties = {} } } = Model
    Object
      .keys(data)
      .forEach(key => {
        const property = properties[key]
        if (
          property
          && ['object', 'json', 'array'].includes(property.type)
        ) {
          // eslint-disable-next-line no-param-reassign
          data[key] = JSON.stringify(data[key])
        }
        if (
          property
          && property.type === 'date'
        ) {
          // eslint-disable-next-line no-param-reassign
          data[key] = data[key] instanceof Date ? data[key] : new Date(data[key])
        }
      })
  }

  Model.beforeCreate(parseJsonData)
  Model.beforeUpdate(parseJsonData)

  return class extends Model {
    toJSON () {
      const values = { ...this.get({ plain: true }) }
      if (typeof values === 'object') {
        if (Array.isArray(values)) {
          return values.map(value => this.$formatJson(value))
        }
        return this.$formatJson(values)
      }
      return values
    }

    $formatJson (data) {
      const { modelDef: { properties = {} } } = Model
      Object.keys(data).forEach(key => {
        const property = properties[key]
        if (
          property
          && ['object', 'json', 'array'].includes(property.type)
        ) {
          // eslint-disable-next-line no-param-reassign
          data[key] = JSON.parse(data[key])
        }
        if (
          property
          && property.type === 'date'
        ) {
          // eslint-disable-next-line no-param-reassign
          data[key] = data[key] ? data[key].getTime() : 0
        }
        if (property && property.hidden) {
          // eslint-disable-next-line no-param-reassign
          delete data[key]
        }
      })
      return data
    }

    static async remoteFindPage (ctx) {
      const { request: { query } } = ctx
      const filter = sequelizeQueryFilter(query, ctx.models)
      const [total, list] = await Promise.all([
        await this.count(filter),
        await this.findAll(filter)
      ])
      return {
        list: list.map(item => item.toJSON()),
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
      const inst = await this.create(body)
      return inst.toJSON()
    }

    static async remoteShow (ctx) {
      const { params: { id } } = ctx
      const inst = await this.findByPk(id)
      return inst.toJSON()
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
