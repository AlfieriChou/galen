const KoaRouter = require('koa-router')
const { Validator } = require('jsonschema')
const _ = require('lodash')
const { camelJsonKeys } = require('@galenjs/func/lodash')

const BaseController = require('./lib/baseController')

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
  const jsonSchema = { type: 'object', properties: body }
  jsonSchema.required = required
  const validateRet = await v.validate(ctx.request.body, jsonSchema)
  if (validateRet.errors.length > 0) {
    const errMsg = validateRet.errors.reduce((acc, error, index) => ([
      ...acc,
      `${index + 1}: ${error.message}`
    ]), []).join()
    ctx.throw(400, errMsg)
  }
  return next()
}

module.exports = async ({ remoteMethods, modelSchemas, prefix = '/v1' }) => {
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

      const modelSchema = modelSchemas[modelName]
      if (modelSchema.dialect && modelSchema.dialect === 'virtual') {
        // eslint-disable-next-line consistent-return
        return api[apiInfo.method](apiInfo.path, async (ctx) => {
          ctx.body = await ctx.controller[filename][handler](ctx)
        })
      }
      api[apiInfo.method](
        apiInfo.path,
        await checkRoles(apiInfo),
        await validate(apiInfo),
        // eslint-disable-next-line consistent-return
        async (ctx) => {
          if (ctx.controller[filename] && ctx.controller[filename][handler]) {
            const ret = await ctx.controller[filename][handler](ctx)
            ctx.body = {
              code: 200,
              message: 'success',
              result: camelJsonKeys(ret)
            }
            return
          }
          if (BaseController[handler]) {
            const ret = await BaseController[handler](modelName, modelSchema, ctx)
            ctx.body = {
              code: 200,
              message: 'success',
              result: camelJsonKeys(ret)
            }
            return
          }
          ctx.throw(404, 'not found')
        }
      )
    }, Promise.resolve())

  return api
}
