// TODO: exitTimeout from process.env or config
const exitTimeout = 60 * 1000

module.exports = async (server, cleanUp, logger) => {
  const close = () => {
    logger.info('on SIGINT/SIGTERM/SIGUSR2 graceful exit!')
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
  process.on('SIGUSR2', close)
}
