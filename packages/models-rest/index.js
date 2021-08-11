const KoaRouter = require('koa-router')
const { Validator } = require('jsonschema')
const _ = require('lodash')
const { camelJsonKeys } = require('@galenjs/factories/lodash')

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
          if (ctx.models[modelName] && ctx.models[modelName][handler]) {
            const ret = await ctx.models[modelName][handler](ctx)
            ctx.body = {
              code: 0,
              message: 'success',
              data: camelJsonKeys(ret)
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
