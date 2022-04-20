const Amqp = require('../index')

const amqp = new Amqp({
  config: {
    url: 'amqp://localhost:5672',
    sub: {
      test: {
        pullInterval: 1000, // 默认1s拉一次消息
        pullBatchSize: 5 // 每次拉5条
      }
    },
    consumerPath: `${process.cwd()}/test/amqp`
  },
  logger: console
})

const start = async () => {
  await amqp.setup()
}

start()

setInterval(async () => {
  await amqp.send('test', 'hello world')
  // amqp.softExit()
}, 10000)

setTimeout(() => {
  amqp.softExit()
  console.log('----', amqp.isSoftExit)
}, 15000)
