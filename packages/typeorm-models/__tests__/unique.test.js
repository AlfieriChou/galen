const createUnique = require('../lib/unique')

describe('test unique', () => {
  it('properties unique', done => {
    const uniques = createUnique({
      tableName: 'user',
      properties: {
        testUniqueField: {
          type: 'string',
          unique: true
        }
      }
    })
    expect(typeof uniques).toBe('object')
    expect(Array.isArray(uniques)).toBe(true)
    const [unique] = uniques
    expect(unique).toHaveProperty('name')
    expect(unique).toHaveProperty('columns')
    expect(unique.name).toBe('user_test_unique_field')
    expect(JSON.stringify(unique.columns)).toBe(JSON.stringify(['test_unique_field']))
    done()
  })
})