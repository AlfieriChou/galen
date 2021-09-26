const { flatObject } = require('../flat')

describe('flat', () => {
  it('flatObject', async () => {
    const t = () => {
      flatObject([{ a: '1' }])
    };
    expect(t).toThrow(Error)
    expect(t).toThrow('flat must be object')
    const data = flatObject({ a: { b: 'c' } })
    expect(data).toMatchObject({ b: 'c' })
  })
})
