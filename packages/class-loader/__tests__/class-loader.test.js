const path = require('path')
const classLoader = require('..')

describe('class-loader', () => {
  it('normal', done => {
    const service = classLoader(path.resolve(__dirname, './service'))
    expect(service).toHaveProperty('test')
    expect(service.test.hello()).toBe('world')
    done()
  })

  it('ignore', done => {
    const service = classLoader(
      path.resolve(__dirname, './service'),
      { ignore: 'test.js' }
    )
    expect(Object.keys(service).length).toEqual(0)
    done()
  })
});
