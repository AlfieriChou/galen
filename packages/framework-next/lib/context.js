const CONTEXT_MODELS = Symbol('Context#models')
const CONTEXT_MODEL_DEFS = Symbol('Context#modelDefs')
const CONTEXT_JSON_SCHEMA = Symbol('Context#jsonSchemas')
const CONTEXT_REMOTE_METHOD = Symbol('Context#remoteMethods')
const CONTEXT_SERVICE = Symbol('Context#service')
const CONTEXT_MIDDLEWARE = Symbol('Context#middleware')

const context = require('koa/lib/context')
const createModels = require('@galenjs/models')

const loadService = require('./loadService')
const loadMiddleware = require('./loadMiddleware')

module.exports = async ({
  workspace = process.cwd(),
  modelDefPath = 'app/modelDef',
  modelPath = 'app/models',
  plugin = {},
  ...config
}) => {
  if (config.models) {
    const {
      models,
      modelDefs,
      jsonSchemas,
      remoteMethods
    } = await createModels({
      workspace,
      plugin,
      modelDefPath,
      modelPath,
      config: config.models
    })
    Object.defineProperties(context, {
      models: {
        get () {
          if (!this[CONTEXT_MODELS]) {
            this[CONTEXT_MODELS] = models
          }
          return this[CONTEXT_MODELS]
        }
      },
      modelDefs: {
        get () {
          if (!this[CONTEXT_MODEL_DEFS]) {
            this[CONTEXT_MODEL_DEFS] = modelDefs
          }
          return this[CONTEXT_MODEL_DEFS]
        }
      },
      jsonSchemas: {
        get () {
          if (!this[CONTEXT_JSON_SCHEMA]) {
            this[CONTEXT_JSON_SCHEMA] = jsonSchemas
          }
          return this[CONTEXT_JSON_SCHEMA]
        }
      },
      remoteMethods: {
        get () {
          if (!this[CONTEXT_REMOTE_METHOD]) {
            this[CONTEXT_REMOTE_METHOD] = remoteMethods
          }
          return this[CONTEXT_REMOTE_METHOD]
        }
      }
    })
  }

  if (config.servicePath) {
    const service = await loadService({
      workspace,
      servicePath: config.servicePath,
      plugin
    })
    Object.defineProperties(context, {
      service: {
        get () {
          if (!this[CONTEXT_SERVICE]) {
            this[CONTEXT_SERVICE] = service
          }
          return this[CONTEXT_SERVICE]
        }
      }
    })
  }

  if (config.middlewarePath) {
    const middleware = await loadMiddleware({
      workspace,
      middlewarePath: config.middlewarePath,
      plugin
    })
    Object.defineProperties(context, {
      middleware: {
        get () {
          if (!this[CONTEXT_MIDDLEWARE]) {
            this[CONTEXT_MIDDLEWARE] = middleware
          }
          return this[CONTEXT_MIDDLEWARE]
        }
      }
    })
  }
}
