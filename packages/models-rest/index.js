const KoaRouter = require('koa-router')
const { Validator } = require('jsonschema')
const _ = require('lodash')
const { snakeJsonKeys } = require('@galenjs/factories/lodash')

const v = new Validator()

const checkRoles = async apiInfo => async (ctx, next) => {
  if (!apiInfo.roles) {
    return next()
  }
  const intersectionRoles = _.intersection(apiInfo.roles, ctx.roles)
  if (intersectionRoles.length === 0) {
    ctx.throw(403, 'permission denied')
  }
  return next()
}

const validate = async apiInfo => async (ctx, next) => {
  if (!apiInfo.requestBody) {
    return next()
  }
  const { body, required = [] } = apiInfo.requestBody
  const jsonSchema = {
    type: 'object',
    properties: Object.entries(body).reduce((acc, [key, value]) => {
      const property = value
      if (['date', 'integer', 'decimal', 'float', 'double', 'bigint'].includes(value.type)) {
        property.type = 'number'
      }
      if (['uuid', 'uuidv1', 'uuidv4', 'text'].includes(value.type)) {
        property.type = 'string'
      }
      // 兼容早期版本
      if (['json'].includes(value.type)) {
        property.type = 'object'
      }
      return {
        ...acc,
        [key]: property
      }
    }, {})
  }
  jsonSchema.required = required
  const validateRet = await v.validate(ctx.request.body, jsonSchema)
  if (validateRet.errors.length > 0) {
    const errMsg = validateRet.errors.reduce((acc, error, index) => ([
      ...acc,
      `${index + 1}: ${error.stack}`
    ]), []).join()
    ctx.throw(400, errMsg)
  }
  return next()
}

module.exports = async ({ remoteMethods, prefix = '/v1' }) => {
  const api = KoaRouter()
  api.prefix(prefix)

  await Object.entries(remoteMethods)
    .reduce(async (promise, [key, apiInfo]) => {
      const [filename, handler] = key.split('-')
      const modelName = _.upperFirst(filename)
      await promise
      if (/^[A-Z]/.test(handler)) {
        return
      }

      api[apiInfo.method](
        apiInfo.path,
        await checkRoles(apiInfo),
        await validate(apiInfo),
        // eslint-disable-next-line consistent-return
        async ctx => {
          ctx.remoteMethod = apiInfo
          if (ctx.models[modelName] && ctx.models[modelName][handler]) {
            const ret = await ctx.models[modelName][handler](ctx)
            if (apiInfo.responseType && apiInfo.responseType === 'origin') {
              ctx.body = ret
              return
            }
            ctx.body = {
              code: 0,
              message: 'success',
              data: snakeJsonKeys(ret)
            }
          } else {
            ctx.body = {
              code: 404,
              message: 'not fount api'
            }
          }
        }
      )
    }, Promise.resolve())

  return api
}
