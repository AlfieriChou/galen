const path = require('path')

const loadModels = require('..')

describe('@galenjs core', () => {
  it('load yaml', async done => {
    const { remoteMethods, modelSchemas, schemas } = await loadModels({
      workspace: path.resolve(__dirname, '.'),
      modelPath: 'yaml'
    })
    expect(typeof remoteMethods).toBe('object')
    expect(remoteMethods).toHaveProperty('user-index', 'user-create', 'user-show', 'user-update', 'user-destroy')
    expect(typeof modelSchemas).toBe('object')
    expect(modelSchemas).toHaveProperty('User')
    expect(typeof schemas).toBe('object')
    expect(schemas).toHaveProperty('User')
    expect(schemas).toHaveProperty('Role')
    expect(schemas).toHaveProperty('UserRole')
    expect(schemas.UserRole.properties).toHaveProperty('userId')
    expect(schemas.UserRole.properties).toHaveProperty('roleId')
    done()
  })

  it('load json', async done => {
    const { remoteMethods, modelSchemas, schemas } = await loadModels({
      workspace: path.resolve(__dirname, '.'),
      modelPath: 'json'
    })
    expect(typeof remoteMethods).toBe('object')
    expect(remoteMethods).toHaveProperty('user-index', 'user-create', 'user-show', 'user-update', 'user-destroy')
    expect(typeof modelSchemas).toBe('object')
    expect(modelSchemas).toHaveProperty('User')
    expect(typeof schemas).toBe('object')
    expect(schemas).toHaveProperty('User')
    done()
  })

  it('load js', async done => {
    const { remoteMethods, modelSchemas, schemas } = await loadModels({
      workspace: path.resolve(__dirname, '.'),
      modelPath: 'js'
    })
    expect(typeof remoteMethods).toBe('object')
    expect(remoteMethods).toHaveProperty('user-index', 'user-create', 'user-show', 'user-update', 'user-destroy')
    expect(typeof modelSchemas).toBe('object')
    expect(modelSchemas).toHaveProperty('User')
    expect(typeof schemas).toBe('object')
    expect(schemas).toHaveProperty('User')
    done()
  })

  it('load js plugins', async done => {
    const { remoteMethods, modelSchemas, schemas } = await loadModels({
      plugins: ['base'],
      workspace: path.resolve(__dirname, '.'),
      modelPath: 'js'
    })
    expect(typeof remoteMethods).toBe('object')
    expect(remoteMethods).toHaveProperty('user-index', 'user-create', 'user-show', 'user-update', 'user-destroy')
    expect(typeof modelSchemas).toBe('object')
    expect(modelSchemas).toHaveProperty('User')
    expect(typeof schemas).toBe('object')
    expect(schemas).toHaveProperty('User')
    // test extend model
    expect(modelSchemas.User.model).toHaveProperty('lastLoginAt')
    expect(schemas.User.properties).toHaveProperty('lastLoginAt')
    done()
  })
})
