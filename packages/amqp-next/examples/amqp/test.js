const logger = console

module.exports = class Test {
  async onMsg (msg) {
    logger.info('[message]: ', msg)
    logger.info('[message content]', msg.content.toString())
  }
}
