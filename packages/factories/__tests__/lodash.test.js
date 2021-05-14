const {
  camelJsonKeys,
  snakeJsonKeys
} = require('../lodash.js')

const camelJson = {
  fieldOne: {
    fieldTwo: 'test'
  },
  fieldThree: 'test',
  fieldFour: [{
    fieldFive: 'test'
  }]
}

const snakeJson = {
  field_one: {
    field_two: 'test'
  },
  field_three: 'test',
  field_four: [{
    field_five: 'test'
  }]
}

describe('lodash', () => {
  it('camelJsonKeys', async () => {
    const data = camelJsonKeys(snakeJson)
    expect(data).toStrictEqual(camelJson)
  })

  it('snakeJsonKeys', async () => {
    const data = snakeJsonKeys(camelJson)
    expect(data).toStrictEqual(snakeJson)
  })
})
