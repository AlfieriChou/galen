const logger = console

module.exports = class Test {
  async onMsg (msg) {
    logger.info('[message]: ', msg)
  }
}
