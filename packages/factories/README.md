# `factories`

> galenjs factories.

## lodash

```javascript
const {
  camelJsonKeys,
  snakeJsonKeys
} = require('@galenjs/factories/lodash')

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
const { sleep } = require('@galenjs/factories/sleep')
await sleep(1000)
```

## validateJsonSchema

```javascript
const validateSchema = require('@galenjs/factories/validateJsonSchema')

await validateSchema({ field: 1 }, {
  type: 'object',
  properties: {
    field: { type: 'string' }
  }
}, {
  extendErr: 'test'
})
```

## parseCsv

```javascript
const { parseCsv } = require('@galenjs/factories/csv')

parseCsv(`id,name
1,Harper Lee
2,JRR Tolkien
3,William Shakespeare`)
```

## crypto

```javascript
const { hash } = require('@galenjs/factories/crypto')

console.log(hash('test'))
```

## customLimit

```javascript
const CustomLimit = require('@galenjs/factories/customLimit')

const customLimit = new CustomLimit()
const ret = await customLimit.execute(`${Date.now()}/1000`, () => 'helloWorld')
console.log(ret)
```
