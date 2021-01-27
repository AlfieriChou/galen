# `func`

> galenjs common function.

## lodash

```javascript
const {
  camelJsonKeys,
  snakeJsonKeys
} = require('@galenjs/func/lodash')

camelJsonKeys({
  field_one: {
    field_two: 'test'
  },
  field_three: 'test',
  field_four: [{
    field_five: 'test'
  }]
})

snakeJsonKeys({
  fieldOne: {
    fieldTwo: 'test'
  },
  fieldThree: 'test',
  fieldFour: [{
    fieldFive: 'test'
  }]
})
```

## sleep

```javascript
const { sleep } = require('@galenjs/func/sleep')
await sleep(1000)
```

## validateJsonSchema

```javascript
const validateSchema = require('@galenjs/func/validateJsonSchema')

await validateSchema({ field: 1 }, {
  type: 'object',
  properties: {
    field: { type: 'string' }
  }
}, {
  extendErr: 'test'
})
```
