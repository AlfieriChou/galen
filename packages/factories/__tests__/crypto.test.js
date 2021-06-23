const { hash } = require('../crypto')

describe('crypto', () => {
  it('hash', async () => {
    const ret = hash('test')
    expect(ret).toBe('098f6bcd4621d373cade4e832627b4f6')
  })
})
