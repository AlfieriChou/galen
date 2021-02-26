const createColumn = require('../lib/column')

describe('test column', () => {
  it('column', done => {
    const ret = createColumn({
      testStringField: {
        type: 'string'
      },
      testNumberField: {
        type: 'number'
      },
      testIntegerField: {
        type: 'integer'
      },
      testBooleanField: {
        type: 'boolean'
      },
      testDateField: {
        type: 'date'
      }
    })
    expect(ret).toHaveProperty('test_string_field')
    expect(ret).toHaveProperty('test_number_field')
    expect(ret).toHaveProperty('test_integer_field')
    expect(ret).toHaveProperty('test_boolean_field')
    expect(ret).toHaveProperty('test_date_field')
    expect(ret.test_string_field).toHaveProperty('type')
    expect(ret.test_number_field).toHaveProperty('type')
    expect(ret.test_integer_field).toHaveProperty('type')
    expect(ret.test_boolean_field).toHaveProperty('type')
    expect(ret.test_date_field).toHaveProperty('type')
    expect(ret.test_string_field.type).toBe(String)
    expect(ret.test_number_field.type).toBe(Number)
    expect(ret.test_integer_field.type).toBe('int')
    expect(ret.test_boolean_field.type).toBe(Boolean)
    expect(ret.test_date_field.type).toBe('date')
    done()
  })
})