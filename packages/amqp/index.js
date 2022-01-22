const amqp = require('amqplib')
const shortId = require('shortid')
const assert = require('assert')
const validateSchema = require('@galenjs/factories/validateJsonSchema')
const classLoader = require('@galenjs/class-loader')

const sleep = (timeout = 3000) => new Promise(resolve => setTimeout(resolve, timeout))

module.exports = class Amqp {
  constructor ({
    config,
    logger,
    app = {}
  }) {
    assert(logger, '[amqp] logger is required')
    validateSchema(config || app.config, {
      type: 'object',
      properties: {
        url: { type: 'string' },
        consumerPath: { type: 'string' },
        closedWaitSecond: { type: 'number' }, // default 3
        closedCheckCount: { type: 'number' }, // default 5
        sub: { type: 'object' }
      },
      required: ['url', 'sub', 'consumerPath']
    })
    this.config = config || app.config
    this.app = app
    this.timers = {}
    this.runTimers = {}
    this.amqpService = {}
    this.logger = logger || this.app.coreLogger
    this.isSoftExit = false
  }

  async closed (closedCheckCount = 1) {
    const notDestroyedIntervals = Object.entries(this.timers)
    // eslint-disable-next-line no-underscore-dangle
      .filter(([, interval]) => !interval._destroyed)
    if (
      !notDestroyedIntervals.length
      || closedCheckCount > (this.config.closedCheckCount || 5)
    ) {
      await this.client.close()
      return
    }
    await sleep((this.config.closedWaitSecond || 3) * 1000)
    await this.closed(closedCheckCount + 1)
  }

  async softExit () {
    this.isSoftExit = true
    if (this.app && this.app.on) {
      this.app.on('pendingCount0', async () => {
        await this.closed()
      })
    } else {
      await this.closed()
    }
  }

  async consumer (channelName, run) {
    const { als } = this.app
    await this.channel.consume(
      channelName,
      async message => {
        const { fields } = message
        this.logger.info('[amqp] consumer: ', channelName, fields.consumerTag)
        if (als) {
          await als.run({
            msgId: fields.consumerTag,
            topic: channelName
          }, async () => {
            await run(message)
          })
        } else {
          await run(message)
        }
        this.logger.info('[amqp] consumer done: ', channelName, fields.consumerTag)
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
        this.runTimers[key] = false
        this.timers[key] = setInterval(async () => {
          if (this.isSoftExit) {
            if (!this.runTimers[key]) {
              clearInterval(this.timers[key])
            }
            return
          }
          // run timer
          if (this.runTimers[key]) {
            return
          }
          this.runTimers[key] = true
          await new Array(pullBatchSize)
            .fill()
            // eslint-disable-next-line no-unused-vars
            .reduce(async (consumerMsgPromise, _item) => {
              await consumerMsgPromise
              // TODO: control cluster concurrency
              await this.consumer(key, async msg => {
                await this.amqpService[key].onMsg(msg, ctx)
              })
            }, Promise.resolve())
          this.runTimers[key] = false
        }, pullInterval)
      }, Promise.resolve())
  }

  async send (channelName, message, options = {}) {
    const msg = JSON.stringify({
      id: shortId.generate(),
      message
    })
    return this.channel.sendToQueue(
      channelName,
      Buffer.from(msg),
      options
    )
  }
}
