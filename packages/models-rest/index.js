const KoaRouter = require('koa-router')
const { Validator } = require('jsonschema')
const _ = require('lodash')
const { snakeJsonKeys } = require('@galenjs/factories/lodash')
const Secret = require('./lib/secret')

const v = new Validator()
const secret = new Secret()

const checkRoles = async apiInfo => async (ctx, next) => {
  if (!apiInfo.roles || !ctx.roles) {
    return next()
  }
  ctx.timing.start('checkRoles')
  const intersectionRoles = _.intersection(apiInfo.roles, ctx.roles)
  ctx.timing.end('checkRoles')
  if (intersectionRoles.length === 0) {
    ctx.throw(403, 'permission denied')
  }
  return next()
}

const validateRequestBody = async apiInfo => async (ctx, next) => {
  if (!apiInfo.requestBody) {
    return next()
  }
  ctx.timing.start('validateRequestBody')
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
  const validateRet = v.validate(ctx.request.body, jsonSchema)
  ctx.timing.end('validateRequestBody')
  if (validateRet.errors.length > 0) {
    const errMsg = validateRet.errors.reduce((acc, error, index) => ([
      ...acc,
      `${index + 1}: ${error.stack}`
    ]), []).join()
    ctx.throw(400, errMsg)
  }
  return next()
}

const decryptedData = async () => async (ctx, next) => {
  const { secretType } = ctx.remoteMethod
  // TODO: 支持双向加密
  if (secretType && secretType === 'client') {
    ctx.timing.start('decryptedData')
    ctx.assert(ctx.request.body.clientId, 'clientId is required')
    ctx.assert(ctx.request.body.iv, 'iv is required')
    ctx.assert(ctx.request.body.encryptedKey, 'encryptedKey is required')
    ctx.assert(ctx.request.body.encryptedData, 'encryptedData is required')
    const {
      iv, encryptedKey, encryptedData, clientId
    } = ctx.request.body
    const rsaKeys = await secret.getRSAKeys(clientId, ctx)
    if (!rsaKeys || !rsaKeys.privateKey) {
      ctx.throw(403, 'LOAD_PRIVATE_KEY_ERROR')
    }
    try {
      const data = await secret.decryptedData(encryptedData, {
        privateKey: rsaKeys.privateKey, encryptedKey, iv
      })
      ctx.request.body = data
    } catch (err) {
      ctx.logger.error('decrypted.error', err)
      ctx.throw(403, 'DECRYPTED_DATA_ERROR')
    }
    ctx.timing.end('decryptedData')
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
        (ctx, next) => {
          ctx.remoteMethod = apiInfo
          return next()
        },
        await decryptedData(),
        await checkRoles(apiInfo),
        await validateRequestBody(apiInfo),
        // eslint-disable-next-line consistent-return
        async ctx => {
          if (ctx.models[modelName] && ctx.models[modelName][handler]) {
            ctx.timing.start('handler')
            const ret = await ctx.models[modelName][handler](ctx)
            ctx.timing.end('handler')
            if (apiInfo.responseType && apiInfo.responseType === 'origin') {
              ctx.body = ret
              return
            }
            ctx.body = {
              code: 0,
              message: 'success',
              data: snakeJsonKeys(ret),
              trace_id: ctx.state.requestId || ctx.get('X-Request-Id')
            }
          } else {
            ctx.body = {
              code: 404,
              message: 'not fount api',
              trace_id: ctx.state.requestId || ctx.get('X-Request-Id')
            }
          }
        }
      )
    }, Promise.resolve())

  api.get('/generateRSA', async ctx => {
    ctx.body = await secret.generateRSAPublicKey(ctx)
  })

  return api
}
