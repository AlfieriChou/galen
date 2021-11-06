const winston = require('winston')
require('winston-daily-rotate-file')

const createTransports = (logDir, transportConfig, als) => {
  const printfFormatter = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format(info => {
      // eslint-disable-next-line no-param-reassign
      info.requestId = als ? als.get().requestId : 'system'
      return info
    })(),
    // TODO: add method url runtime
    winston.format.printf(info => {
      let logStrFormat = `[-${info.timestamp}/${info.requestId}/${info.level}]`
      if (info.message) {
        logStrFormat += ` ${info.message}`
      }
      if (info.stack) {
        logStrFormat += ` ${info.stack}`
      }
      return logStrFormat
    })
  )
  if (process.env.NODE_ENV !== 'production') {
    return [new winston.transports.Console({
      format: printfFormatter
    })]
  }
  return ['error', 'warn', 'info'].map(level => {
    return new winston.transports.DailyRotateFile({
      level,
      ...transportConfig,
      filename: `${logDir}/logs/${level === 'info' ? 'application' : level}-%DATE%.log`,
      format: printfFormatter
    })
  })
}

module.exports = ({
  logDir,
  ...loggerConfig
}, als) => {
  const transports = createTransports(logDir, loggerConfig, als)
  const logger = winston.createLogger({
    transports
  })
  return {
    warn: (...args) => {
      const err = args.find(arg => arg instanceof Error)
      const messages = args.filter(arg => !(arg instanceof Error))
      logger.log('warn', messages.join(' '), { stack: err.stack })
    },
    error: (...args) => {
      const err = args.find(arg => arg instanceof Error)
      const messages = args.filter(arg => !(arg instanceof Error))
      logger.log('error', messages.join(' '), { stack: err.stack })
    },
    info: (...args) => logger.info({
      level: 'info',
      message: args.join(' ')
    })
  }
}
