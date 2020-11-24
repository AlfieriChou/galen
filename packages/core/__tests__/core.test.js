const path = require('path')

const loadModels = require('..')

describe('@galenjs core', () => {
  it('load yaml', async done => {
    const { remoteMethods, modelSchemas, schemas } = await loadModels(path.resolve(__dirname, './yaml'))
    expect(typeof remoteMethods).toBe('object')
    expect(typeof modelSchemas).toBe('object')
    expect(typeof schemas).toBe('object')
    done()
  })

  it('load json', async done => {
    const { remoteMethods, modelSchemas, schemas } = await loadModels(path.resolve(__dirname, './json'))
    expect(typeof remoteMethods).toBe('object')
    expect(typeof modelSchemas).toBe('object')
    expect(typeof schemas).toBe('object')
    done()
  })
})
