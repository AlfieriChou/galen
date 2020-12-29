# `influx`

> galenjs influx client.

## Usage

```javascript
const createInfluxClient = require('influx')

const bootstrap = async () => {
  const db = await createInfluxClient(schemas, {
    host: '127.0.0.1',
    database: 'test'
  })
}

bootstrap()
```
