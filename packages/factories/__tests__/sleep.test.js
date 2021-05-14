const { sleep } = require('../sleep.js')

describe('sleep', () => {
  it('sleep', async () => {
    const start = Date.now()
    await sleep()
    const time = Date.now() - start
    expect(time).toBeGreaterThanOrEqual(999)
    expect(time).toBeLessThan(1200)
  })
})
