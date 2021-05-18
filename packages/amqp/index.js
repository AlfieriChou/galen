const amqp = require('amqplib')
const validateSchema = require('@galenjs/factories/validateJsonSchema')

module.exports = class Amqp {
  constructor (config) {
    this.config = config
    validateSchema(config, {
      type: 'object',
      properties: {
        url: { type: 'string' },
        sub: { type: 'object' }
      },
      required: ['url', 'sub']
    })
    this.client = amqp.connect(this.config.url)
    this.timers = {}
  }

  async quit () {
    Object.entries(this.timers)
      .forEach(([, interval]) => clearInterval(interval))
    await this.client.close()
  }

  async consumer (channelName, run) {
    await this.channel.consume(
      channelName,
      async (message) => {
        await run(message)
        this.channel.ack(message)
      }
    )
  }

  async setup () {
    this.channel = await this.client.createChannel()
    await Promise.all(
      Object.entities(this.config.sub)
        .forEach(async ([key, {
          pullInterval = 1000, // 默认1s拉一次消息
          pullBatchSize = 5 // 默认每次拉五条
        }]) => {
          await this.channel.assertQueue(key)
          this.timers[key] = setInterval(async () => {
            await Promise.all(
              new Array(pullBatchSize)
                .fill()
                .reduce(async (promise, _item) => {
                  await promise
                  await this.consumer(key, (msg) => {
                    console.log('message', msg)
                  })
                }, Promise.resolve())
            )
          }, pullInterval)
        })
    )
  }

  async send (channelName, message, options) {
    return this.channel.sendToQueue(
      channelName,
      Buffer.from(message),
      options
    )
  }
}
