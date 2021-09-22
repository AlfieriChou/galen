const CONTEXT_MODELS = Symbol('Context#models')
const CONTEXT_MODEL_DEFS = Symbol('Context#modelDefs')
const CONTEXT_JSON_SCHEMA = Symbol('Context#jsonSchemas')
const CONTEXT_REMOTE_METHOD = Symbol('Context#remoteMethods')

const context = require('koa/lib/context')
const createModels = require('@galenjs/models')

module.exports = async config => {
  const {
    models,
    modelDefs,
    jsonSchemas,
    remoteMethods
  } = await createModels(config.models)

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
