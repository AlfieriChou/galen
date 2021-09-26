const _ = require('lodash')

const generateBaseRemoteMethods = (modelName, {
  description = modelName,
  properties,
  required = []
}) => ({
  remoteFindPage: {
    path: `/${modelName}`,
    method: 'get',
    roles: ['$everyone'],
    tags: [`${modelName}`],
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
          total: { type: 'integer', description: '总数' },
          list: {
            type: 'array',
            items: {
              type: 'object', properties
            },
            description: '数据'
          }
        }
      }
    }
  },
  remoteCreate: {
    path: `/${modelName}`,
    method: 'post',
    roles: ['$everyone'],
    tags: [`${modelName}`],
    summary: `创建${description}`,
    requestBody: {
      body: _.omit(properties, ['id', 'createdAt', 'updatedAt', 'deletedAt']),
      required
    },
    output: {
      200: {
        type: 'object',
        result: properties
      }
    }
  },
  remoteShow: {
    path: `/${modelName}/:id`,
    method: 'get',
    roles: ['$everyone'],
    tags: [`${modelName}`],
    summary: `获取${description}详情`,
    params: _.pick(properties, ['id']),
    output: {
      200: {
        type: 'object',
        result: properties
      }
    }
  },
  remoteUpdate: {
    path: `/${modelName}/:id`,
    method: 'put',
    roles: ['$everyone'],
    tags: [`${modelName}`],
    summary: `修改${description}信息`,
    params: _.pick(properties, ['id']),
    requestBody: {
      body: _.omit(properties, ['id', 'createdAt', 'updatedAt', 'deletedAt'])
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
  remoteDestroy: {
    path: `/${modelName}/:id`,
    method: 'delete',
    roles: ['$everyone'],
    tags: [`${modelName}`],
    summary: `删除${description}`,
    params: _.pick(properties, ['id']),
    output: {
      200: {
        type: 'number'
      }
    }
  }
})

module.exports = (modelName, schema) => {
  const { dialect, remoteMethods = {} } = schema
  if (dialect && dialect === 'virtual') {
    return remoteMethods
  }
  const baseRemoteMethods = generateBaseRemoteMethods(modelName, schema)
  return {
    ...baseRemoteMethods,
    ...Object.entries(remoteMethods).reduce((acc, [key, value]) => {
      if (baseRemoteMethods[key]) {
        return {
          ...acc,
          [key]: {
            ...baseRemoteMethods[key],
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
