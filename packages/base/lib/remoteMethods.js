const _ = require('lodash')

const buildCrudRemoteMethods = (apiName, {
  description = apiName,
  model,
  required = []
}) => ({
  index: {
    path: `/${apiName}`,
    method: 'get',
    tags: [`${apiName}`],
    summary: `获取${description}列表`,
    query: {
      where: { type: 'json', description: '搜索条件 例如：where={}' },
      order: { type: 'array', description: '排序 例如：order=[["createdAt","desc"]]' },
      attribute: { type: 'array', description: '返回字段控制 例如：attribute=["id"]' },
      include: { type: 'array', description: '关联表 关联查询 例如：include=[{"model":"UserRole"}]' },
      offset: { type: 'integer', description: '分页偏移量 例如：offset=0' },
      limit: { type: 'integer', description: '分页数量 例如：limit=20' }
    },
    output: {
      200: {
        type: 'object',
        result: {
          count: { type: 'integer', description: '总数' },
          offset: { type: 'integer', description: '偏移量' },
          limit: { type: 'integer', description: '限制数量' },
          data: { type: 'array', items: { type: 'object', properties: model }, description: '数据' }
        }
      }
    }
  },
  create: {
    path: `/${apiName}`,
    method: 'post',
    tags: [`${apiName}`],
    summary: `创建${description}`,
    requestBody: {
      body: _.omit(model, ['id', 'createdAt', 'updatedAt', 'deletedAt']),
      required
    },
    output: {
      200: {
        type: 'object',
        result: model
      }
    }
  },
  show: {
    path: `/${apiName}/:id`,
    method: 'get',
    tags: [`${apiName}`],
    summary: `获取${description}详情`,
    params: _.pick(model, ['id']),
    output: {
      200: {
        type: 'object',
        result: model
      }
    }
  },
  update: {
    path: `/${apiName}/:id`,
    method: 'put',
    tags: [`${apiName}`],
    summary: `修改${description}信息`,
    params: _.pick(model, ['id']),
    requestBody: {
      body: _.omit(model, ['id', 'createdAt', 'updatedAt', 'deletedAt'])
    },
    output: {
      200: {
        type: 'array',
        result: {
          type: 'number'
        }
      }
    }
  },
  destroy: {
    path: `/${apiName}/:id`,
    method: 'delete',
    tags: [`${apiName}`],
    summary: `删除${description}`,
    params: _.pick(model, ['id']),
    output: {
      200: {
        type: 'number'
      }
    }
  }
})

module.exports = (apiName, schema) => {
  const { dialect, remoteMethods = {} } = schema
  if (dialect && dialect === 'virtual') {
    return remoteMethods
  }
  const crudRemoteMethods = buildCrudRemoteMethods(apiName, schema)
  return {
    ...crudRemoteMethods,
    ...Object.entries(remoteMethods).reduce((acc, [key, value]) => {
      if (crudRemoteMethods[key]) {
        return {
          ...acc,
          [key]: {
            ...crudRemoteMethods[key],
            ...value
          }
        }
      }
      return {
        ...acc,
        [key]: value
      }
    }, {})
  }
}
