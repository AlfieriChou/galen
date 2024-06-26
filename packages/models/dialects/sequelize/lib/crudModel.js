const sequelizeQueryFilter = require('@galenjs/sequelize-query-filter')

module.exports = Model => {
  return class extends Model {
    toJSON () {
      const values = {
        ...this.get({
          raw: true,
          nest: true
        })
      }
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
        if (property?.hidden) {
          // eslint-disable-next-line no-param-reassign
          delete data[key]
        }
        // TODO: 通过property的type判断，或者通过模型声明处理
        if (data[key] instanceof Date) {
          data[key] = data[key] ? data[key].getTime() : 0
        }
      })
      return data
    }

    static async find (queryFilter, ctx) {
      const filter = sequelizeQueryFilter(
        { query: queryFilter, modelName: Model.modelName },
        ctx
      )
      const rows = await Model.findAll(filter)
      return rows.map(item => item.toJSON())
    }

    static async remoteFindPage (ctx) {
      const { request: { query } } = ctx
      const filter = sequelizeQueryFilter(
        { query, modelName: Model.modelName },
        ctx
      )
      const { count, rows } = await Model.findAndCountAll(filter)
      return {
        list: rows.map(item => item.toJSON()),
        pageInfo: {
          totalNumber: count,
          page: (filter.offset + filter.limit) / filter.limit,
          pageSize: filter.limit,
          totalPage: Math.ceil(count / filter.limit)
        }
      }
    }

    static async remoteCreate (ctx) {
      const { request: { body } } = ctx
      const inst = await Model.create(body)
      return inst.toJSON()
    }

    static async remoteBatchCreate (ctx) {
      const { request: { body } } = ctx
      const ret = await Model.bulkCreate(body.data)
      return ret.map(item => item.toJSON())
    }

    static async remoteShow (ctx) {
      const { params: { id } } = ctx
      const inst = await Model.findByPk(id)
      return inst.toJSON()
    }

    static async remoteUpdate (ctx) {
      const { request: { body }, params: { id } } = ctx
      return Model.update(body, { where: { id } })
    }

    static async remoteDestroy (ctx) {
      const { params: { id } } = ctx
      return Model.destroy({ where: { id } })
    }
  }
}
