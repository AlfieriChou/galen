const validateSchema = require('../validateJsonSchema')

const schema = {
  type: 'object',
  properties: {
    field: { type: 'string' }
  }
}

describe('validate json schema', () => {
  it('correct type', async () => {
    const ret = await validateSchema({ field: 'test' }, schema)
    expect(ret).toHaveProperty('errors')
    expect(ret.errors.length === 0).toBe(true)
  })

  it('no correct type', async () => {
    try {
      await validateSchema({ field: 1 }, schema)
    } catch (err) {
      expect(err.message.includes('field')).toBe(true)
      expect(err.message.includes('not of')).toBe(true)
      expect(err.message.includes('string')).toBe(true)
    }
  })
})
