const { parseCsv } = require('../csv')

const authorsCsv = `id,name
1,Harper Lee
2,JRR Tolkien
3,William Shakespeare`

describe('csv', () => {
  it('parseCsv', async () => {
    const data = parseCsv(authorsCsv)
    expect(data.length).toBe(3)
    expect(data).toMatchObject([{
      id: '1',
      name: 'Harper Lee'
    }, {
      id: '2',
      name: 'JRR Tolkien'
    }, {
      id: '3',
      name: 'William Shakespeare'
    }])
  })
})
