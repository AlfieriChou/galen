const BullMq = require('../index')

const bullMq = new BullMq({
  config: {
    connection: {
      host: '127.0.0.q'
    },
    sub: {
      test: {
        queueName: 'GALEN'
      }
    },
    consumerPath: `${process.cwd()}/examples/queue`
  },
  logger: console
})

const start = async () => {
  await bullMq.setup()
}

start()

setInterval(async () => {
  await bullMq.send('GALEN', 'test', {
    message: 'hello world'
  })
  // bullMq.softExit()
}, 10000)

setTimeout(() => {
  bullMq.softExit()
}, 15000)
