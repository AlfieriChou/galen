# `redis`

> galenjs redis lib.

## Usage

```javascript
const createRedisClient = require('@galenjs/redis');

const bootstrap = () => {
  const client = await createRedisClient({
    default: {
      host: '127.0.0.1',
      port: 6379
    },
    clients: {
      main: {
        keyPrefix: 'test',
        db: 1
      }
    }
  })

  await client.set('main', 'key', 'value')
  const ret = await client.get('main', 'key')
  console.log(ret) // 'value'
}

bootstrap()
```

support connect multi instance
