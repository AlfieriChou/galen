const path = require('path')

const loadModels = require('..')

describe('@galenjs base', () => {
  it('load yaml', async () => {
    const { remoteMethods, modelDefs, jsonSchemas } = await loadModels({
      workspace: path.resolve(__dirname, '.'),
      modelDefPath: 'yaml'
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
    // test relation add indexes
    expect(modelDefs.UserRole.indexes).toHaveProperty('user_role_user_id')
    expect(modelDefs.UserRole.indexes).toHaveProperty('user_role_role_id')
  })

  it('load json', async () => {
    const { remoteMethods, modelDefs, jsonSchemas } = await loadModels({
      workspace: path.resolve(__dirname, '.'),
      modelDefPath: 'json'
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
      modelDefPath: 'json'
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
