# `amqp`

> galenjs amqp consumer and producer

## Usage

install

```bash
yarn add @galenjs/amqp
// or
npm i @galenjs/amqp
// or
pnpm install @galenjs/amqp
```

```javascript
// app.js
const Amqp = require('./index')

const amqp = new Amqp({
  config: {
    url: 'amqp://localhost:5672',
    sub: {
      test: {
        pullInterval: 1000, // 默认1s拉一次消息
        pullBatchSize: 5 // 每次拉5条
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
  await amqp.send('test', 'hello world')
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
