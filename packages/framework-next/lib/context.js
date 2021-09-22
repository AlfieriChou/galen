const CONTEXT_MODELS = Symbol('Context#models')
const CONTEXT_MODEL_DEFS = Symbol('Context#modelDefs')
const CONTEXT_JSON_SCHEMA = Symbol('Context#jsonSchemas')
const CONTEXT_REMOTE_METHOD = Symbol('Context#remoteMethods')
const CONTEXT_CONTROLLER = Symbol('Context#controller')
const CONTEXT_SERVICE = Symbol('Context#service')
const CONTEXT_MIDDLEWARE = Symbol('Context#middleware')

const context = require('koa/lib/context')
const createModels = require('@galenjs/models')

const loadController = require('./loadController')
const loadService = require('./loadService')
const loadMiddleware = require('./loadMiddleware')

module.exports = async config => {
  const {
    models,
    modelDefs,
    jsonSchemas,
    remoteMethods
  } = await createModels({
    workspace: config.workspace,
    modelDefPath: config.modelDefPath,
    modelPath: config.modelPath,
    config: config.models
  })

  const controller = await loadController({
    workspace: config.workspace,
    controllerPath: config.controllerPath,
    plugin: config.plugin || {}
  })

  const service = await loadService({
    workspace: config.workspace,
    servicePath: config.servicePath,
    plugin: config.plugin || {}
  })

  const middleware = await loadMiddleware({
    workspace: config.workspace,
    middlewarePath: config.middlewarePath,
    plugin: config.plugin || {}
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
    },
    controller: {
      get () {
        if (!this[CONTEXT_CONTROLLER]) {
          this[CONTEXT_CONTROLLER] = controller
        }
        return this[CONTEXT_CONTROLLER]
      }
    },
    service: {
      get () {
        if (!this[CONTEXT_SERVICE]) {
          this[CONTEXT_SERVICE] = service
        }
        return this[CONTEXT_SERVICE]
      }
    },
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
