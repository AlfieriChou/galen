const exitTimeout = 60 * 1000

module.exports = async (server, cleanUp, logger = console) => {
  const close = () => {
    logger.info('on SIGTERM wait requests')
    server.close(async () => {
      logger.info('wait cleanUp')
      await cleanUp()
      logger.info('done cleanUp')
      process.exit(0)
    })
    setTimeout(() => {
      logger.error('force exit')
      process.exit(0)
    }, exitTimeout)
  }
  process.on('SIGINT', close)
  process.on('SIGTERM', close)
}
