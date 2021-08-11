module.exports = Model => {
  return class extends Model {
    static async index (ctx) {
      const { request: { query } } = ctx
      return {
        data: query,
        list: [],
        pageInfo: {
          totalNumber: 0,
          page: 0,
          pageSize: 0,
          totalPage: 0
        }
      }
    }

    static async create (ctx) {
      const { request: { body } } = ctx
      return { body }
    }

    static async show (ctx) {
      const { params: { id } } = ctx
      return { id }
    }

    static async update (ctx) {
      const { request: { body }, params: { id } } = ctx
      return { id, body }
    }

    static async destroy (ctx) {
      const { params: { id } } = ctx
      return { id }
    }
  }
}
