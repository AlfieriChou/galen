const createIndices = require('../lib/indices')

describe('test index', () => {
  it('properties index', done => {
    const indices = createIndices({
      tableName: 'user',
      properties: {
        testIndexField: {
          type: 'string',
          index: true
        }
      }
    })
    expect(typeof indices).toBe('object')
    expect(Array.isArray(indices)).toBe(true)
    const [index] = indices
    expect(index).toHaveProperty('name')
    expect(index).toHaveProperty('columns')
    expect(index.name).toBe('user_test_index_field')
    expect(JSON.stringify(index.columns)).toBe(JSON.stringify(['test_index_field']))
    done()
  })

  it('properties multi index', done => {
    const indices = createIndices({
      tableName: 'user',
      properties: {
        testIndexFieldOne: {
          type: 'string',
          index: true
        },
        testIndexFieldTwo: {
          type: 'string',
          index: true
        }
      }
    })
    expect(typeof indices).toBe('object')
    expect(Array.isArray(indices)).toBe(true)
    const [index] = indices
    expect(index).toHaveProperty('name')
    expect(index).toHaveProperty('columns')
    expect(JSON.stringify(indices)).toBe(JSON.stringify([{
      name: 'user_test_index_field_one',
      columns: ['test_index_field_one']
    }, {
      name: 'user_test_index_field_two',
      columns: ['test_index_field_two']
    }]))
    done()
  })
})