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

### 支持配置多实例

```js
{
  default: {
    host: '127.0.0.1',
    port: 6379
  },
  clients: {
    main: {
      keyPrefix: 'main',
      db: 1
    },
    test: {
      keyPrefix: 'test',
      db: 2
    }
  }
}
```

* default为默认配置可以为空对象
* clients则是需要配置的配置实例的信息

### 安全关闭

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

  // do something
  // get
  await client.get('main', 'test')
  // set
  await client.set('main', 'test', 'value', 10)
  // incr
  await client.incr('main', 'test', 10)
  // decr
  await client.decr('main', 'test', 10)
  // getJson
  await client.getJson('main', 'test')
  // setJson
  await client.setJson('main', 'test', { a: 'b' }, 10)

  // select redis instance
  client.select('main')

  // graceful exit
  await client.quit()
}

bootstrap()
```
