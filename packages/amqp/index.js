const amqp = require('amqplib')
const shortId = require('shortid')
const assert = require('assert')
const validateSchema = require('@galenjs/factories/validateJsonSchema')
const classLoader = require('@galenjs/class-loader')

module.exports = class Amqp {
  constructor ({
    config,
    logger
  }) {
    assert(logger, '[amqp] logger is required')
    validateSchema(config, {
      type: 'object',
      properties: {
        url: { type: 'string' },
        consumerPath: { type: 'string' },
        sub: { type: 'object' }
      },
      required: ['url', 'sub', 'consumerPath']
    })
    this.config = config
    this.timers = {}
    this.amqpService = {}
    this.logger = logger
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
        // TODO: 填充消息ID
        this.logger.info('[amqp] consumer: ', channelName)
        await run(message)
        this.logger.info('[amqp] consumer done: ', channelName)
        this.channel.ack(message)
      }
    )
  }

  async setup (ctx) {
    this.client = await amqp.connect(this.config.url)
    this.channel = await this.client.createChannel()
    this.amqpService = classLoader(this.config.consumerPath)
    Object.entries(this.config.sub)
      .reduce(async (promise, [key, {
        pullInterval = 1000, // 默认1s拉一次消息
        pullBatchSize = 5 // 默认每次拉五条
      }]) => {
        await promise
        await this.channel.assertQueue(key)
        this.timers[key] = setInterval(async () => {
          new Array(pullBatchSize)
            .fill()
            .forEach(async (_item) => {
              await this.consumer(key, async (msg) => {
                await this.amqpService[key].onMsg(msg, ctx)
              })
            })
        }, pullInterval)
      }, Promise.resolve())
  }

  async send (channelName, message, options = {}) {
    const msg = JSON.stringify({
      id: shortId.generate(),
      message
    })
    const ret = await this.channel.sendToQueue(
      channelName,
      Buffer.from(msg),
      options
    )
    this.logger.info('[amqp] send msg: ', channelName, msg, ret)
    return ret
  }
}
