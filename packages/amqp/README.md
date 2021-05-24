# `amqp`

> galenjs amqp consumer and producer

## Usage

app.js

```javascript
const Amqp = require('./index')

const amqp = new Amqp({
  config: {
    url: 'amqp://localhost:5672',
    sub: {
      test: {}
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

test/test.js

```javascript
module.exports = class Test {
  static async onMsg (msg) {
    console.log('[message]: ', msg)
  }
}
```
