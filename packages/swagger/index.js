const _ = require('lodash')
const assert = require('assert')

const resTypeList = ['array', 'object', 'number', 'string', 'html']

module.exports = (info, { schemas, remoteMethods }) => {
  const methods = Object.entries(remoteMethods)
    .reduce((methodRet, [schemaKey, {
      path, method, tags, summary, query, params, requestBody, output
    }]) => {
      assert(path, `${schemaKey} path is required`)
      assert(method, `${schemaKey} method is required`)
      const content = {
        tags: tags || ['default'],
        summary: summary || ''
      }
      if (query || params) {
        content.parameters = Object.entries(query || params)
          .reduce((ret, [propKey, propValue]) => (
            [...ret, {
              name: propKey,
              in: query ? 'query' : 'path',
              description: propValue.description,
              schema: {
                type: propValue.type
              },
              required: !query
            }]
          ), [])
      }
      if (requestBody) {
        content.requestBody = {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: requestBody.body,
                required: requestBody.required
              }
            }
          }
        }
      }
      if (output) {
        content.responses = Object.entries(output)
          .reduce((outputRets, [responseKey, { type, result }]) => {
            if (!resTypeList.includes(type)) throw new Error('output type mast ba array or object or number or string or html!')
            if (type === 'html') {
              return {
                ...outputRets,
                [responseKey]: {
                  description: 'response success',
                  content: {
                    'text/html': {}
                  }
                }
              }
            }
            // eslint-disable-next-line no-param-reassign
            outputRets[200] = {
              description: 'response success',
              content: {
                'application/json': {
                  schema: { $ref: `#/components/schemas/${schemaKey.split('-')[0]}` }
                }
              }
            }
            let outputSchema
            if (type === 'array') {
              outputSchema = {
                type: 'array',
                items: result || {
                  type: 'string'
                }
              }
            }
            if (type === 'object') {
              outputSchema = { type: 'object', properties: result || {} }
            }
            if (type === 'number') {
              outputSchema = { type: 'object', properties: { result: { type: 'number', description: '返回标识' } } }
            }
            if (type === 'string') {
              outputSchema = { type: 'object', properties: { result: { type: 'string', description: '返回标识' } } }
            }
            return {
              ...outputRets,
              [responseKey]: {
                description: 'response success',
                content: {
                  'application/json': {
                    schema: outputSchema
                  }
                }
              }
            }
          }, {})
      }
      return [
        ...methodRet,
        {
          [path]: {
            [method]: content
          }
        }
      ]
    }, [])
  return {
    openapi: '3.0.0',
    info,
    paths: methods.reduce((acc, method) => _.merge(acc, method), {}),
    components: {
      schemas
    }
  }
}
