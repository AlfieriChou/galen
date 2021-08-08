const path = require('path')

const loadModels = require('..')

describe('@galenjs base', () => {
  it('load yaml', async () => {
    const { remoteMethods, modelDefs, jsonSchemas } = await loadModels({
      workspace: path.resolve(__dirname, '.'),
      modelPath: 'yaml'
    })
    expect(typeof remoteMethods).toBe('object')
    expect(remoteMethods).toHaveProperty('user-index', 'user-create', 'user-show', 'user-update', 'user-destroy')
    expect(typeof modelDefs).toBe('object')
    expect(modelDefs).toHaveProperty('User')
    expect(typeof jsonSchemas).toBe('object')
    expect(jsonSchemas).toHaveProperty('User')
    expect(jsonSchemas).toHaveProperty('Role')
    expect(jsonSchemas).toHaveProperty('UserRole')
    expect(modelDefs.UserRole.properties).toHaveProperty('userId')
    expect(modelDefs.UserRole.properties).toHaveProperty('roleId')
    expect(jsonSchemas.UserRole.properties).toHaveProperty('userId')
    expect(jsonSchemas.UserRole.properties).toHaveProperty('roleId')
  })

  it('load json', async () => {
    const { remoteMethods, modelDefs, jsonSchemas } = await loadModels({
      workspace: path.resolve(__dirname, '.'),
      modelPath: 'json'
    })
    expect(typeof remoteMethods).toBe('object')
    expect(remoteMethods).toHaveProperty('user-index', 'user-create', 'user-show', 'user-update', 'user-destroy')
    expect(typeof modelDefs).toBe('object')
    expect(modelDefs).toHaveProperty('User')
    expect(typeof jsonSchemas).toBe('object')
    expect(jsonSchemas).toHaveProperty('User')
  })

  it('load json plugins', async () => {
    const { remoteMethods, modelDefs, jsonSchemas } = await loadModels({
      plugins: ['base'],
      workspace: path.resolve(__dirname, '.'),
      modelPath: 'json'
    })
    expect(typeof remoteMethods).toBe('object')
    expect(remoteMethods).toHaveProperty('user-index', 'user-create', 'user-show', 'user-update', 'user-destroy')
    expect(typeof modelDefs).toBe('object')
    expect(modelDefs).toHaveProperty('User')
    expect(typeof jsonSchemas).toBe('object')
    expect(jsonSchemas).toHaveProperty('User')
    // test extend model
    expect(modelDefs.User.properties).toHaveProperty('lastLoginAt')
    expect(jsonSchemas.User.properties).toHaveProperty('lastLoginAt')
  })
})
