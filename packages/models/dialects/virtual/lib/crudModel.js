module.exports = Model => {
  return class extends Model {
    static async remoteFindPage (ctx) {
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

    static async remoteCreate (ctx) {
      const { request: { body } } = ctx
      return { body }
    }

    static async remoteShow (ctx) {
      const { params: { id } } = ctx
      return { id }
    }

    static async remoteUpdate (ctx) {
      const { request: { body }, params: { id } } = ctx
      return { id, body }
    }

    static async remoteDestroy (ctx) {
      const { params: { id } } = ctx
      return { id }
    }
  }
}
