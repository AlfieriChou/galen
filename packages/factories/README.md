# `factories`

> galenjs factories.

## lodash

### camelJsonKeys

```javascript
const { camelJsonKeys } = require('@galenjs/factories/lodash')

camelJsonKeys({
  field_one: {
    field_two: 'test'
  },
  field_three: 'test',
  field_four: [{
    field_five: 'test'
  }]
})
```

### snakeJsonKeys

```javascript
const { snakeJsonKeys } = require('@galenjs/factories/lodash')

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

## csv

### parseCsv

```javascript
const { parseCsv } = require('@galenjs/factories/csv')

parseCsv({
  data: `id,name
1,Harper Lee
2,JRR Tolkien
3,William Shakespeare`,
  endsWithLine: '\n',
  delimiter: ','
})
```

### writeCsv

```javascript
const { writeCsv } = require('@galenjs/factories/csv')

writeCsv({
  filePath: 'test.csv',
  header: 'id,name',
  data: [{ id: 1, name: "Harper Lee" }],
  fields: ['id', 'name'],
  writeLineLength: 1,
  endsWithLine: '\r\n'
})
```

## crypto

### hash

```javascript
const { hash } = require('@galenjs/factories/crypto')

console.log(hash('test'))
```

### encrypted

```javascript
const { encrypted } = require('@galenjs/factories/crypto')

const tt = 'abc'
const iv = crypto.randomBytes(16).toString('base64')
const key = crypto.randomBytes(16).toString('base64')
encrypted(tt, { key, iv })
```

### decrypted

```javascript
const { decrypted } = require('@galenjs/factories/crypto')

const iv = crypto.randomBytes(16).toString('base64')
const key = crypto.randomBytes(16).toString('base64')
const decryptedData = decrypted(encryptedData, { key, iv })
```

## customLimit

```javascript
const CustomLimit = require('@galenjs/factories/customLimit')

const customLimit = new CustomLimit()
const ret = await customLimit.execute(`${Date.now()}/1000`, () => 'helloWorld')
console.log(ret)
```
