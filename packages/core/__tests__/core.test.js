const path = require('path')

const loadModels = require('..')

describe('@galenjs core', () => {
  it('load yaml', async done => {
    const { remoteMethods, modelSchemas, schemas } = await loadModels(path.resolve(__dirname, './yaml'))
    expect(typeof remoteMethods).toBe('object')
    expect(remoteMethods).toHaveProperty('user-index', 'user-create', 'user-show', 'user-update', 'user-destroy')
    expect(typeof modelSchemas).toBe('object')
    expect(modelSchemas).toHaveProperty('User')
    expect(typeof schemas).toBe('object')
    expect(schemas).toHaveProperty('User')
    done()
  })

  it('load json', async done => {
    const { remoteMethods, modelSchemas, schemas } = await loadModels(path.resolve(__dirname, './json'))
    expect(typeof remoteMethods).toBe('object')
    expect(remoteMethods).toHaveProperty('user-index', 'user-create', 'user-show', 'user-update', 'user-destroy')
    expect(typeof modelSchemas).toBe('object')
    expect(modelSchemas).toHaveProperty('User')
    expect(typeof schemas).toBe('object')
    expect(schemas).toHaveProperty('User')
    done()
  })

  it('load js', async done => {
    const { remoteMethods, modelSchemas, schemas } = await loadModels(path.resolve(__dirname, './js'))
    expect(typeof remoteMethods).toBe('object')
    expect(remoteMethods).toHaveProperty('user-index', 'user-create', 'user-show', 'user-update', 'user-destroy')
    expect(typeof modelSchemas).toBe('object')
    expect(modelSchemas).toHaveProperty('User')
    expect(typeof schemas).toBe('object')
    expect(schemas).toHaveProperty('User')
    done()
  })
})
