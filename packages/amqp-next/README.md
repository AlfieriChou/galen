# `amqp-next`

> TODO: description

## Usage

install

```bash
yarn add @galenjs/amqp-next
// or
npm i @galenjs/amqp-next
// or
pnpm install @galenjs/amqp-next
```

- original

```javascript
// app.js
const Amqp = require('./index')

const amqp = new Amqp({
  config: {
    url: 'amqp://localhost:5672',
    sub: {
      test: {
        pullInterval: 1000, // 默认1s拉一次消息
        pullBatchSize: 5, // 每次拉5条
        topic: 'GALEN' // topic
      }
    },
    consumerPath: `${process.cwd()}/test`
  },
  logger: console
})

const start = async () => {
  await amqp.setup()
}

start()

setInterval(async () => {
  /**
   * topic
   * routeKey
   * content
   * options
  */
  await amqp.send('GALEN', 'test', 'hello world')
}, 10000)
```

```javascript
// test/test.js
module.exports = class Test {
  async onMsg (msg) {
    console.log('[message]: ', msg)
  }
}
```

- support galenjs framework app and context

```javascript
// app.js
const Amqp = require('./index')

const amqp = new Amqp({
  config: {
    url: 'amqp://localhost:5672',
    sub: {
      test: {
        pullInterval: 1000, // 默认1s拉一次消息
        pullBatchSize: 5, // 每次拉5条
        topic: 'GALEN' // topic
      }
    },
    consumerPath: `${process.cwd()}/test`
  },
  logger: console,
  app
})

const start = async () => {
  await amqp.setup(ctx)
}

start()
```
