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
  }

  async quit () {
    await this.client.close()
  }

  async createChannels () {
    this.channel = await this.client.createChannel()
    Promise.all(
      Object.keys(this.config.sub)
        .forEach(async ([key]) => {
          await this.channel.assertQueue(key)
        // create dynamic consume
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
