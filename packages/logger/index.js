const winston = require('winston')
require('winston-daily-rotate-file')

const createTransports = (logDir, transportConfig, als) => {
  const printfFormatter = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss,SSS' }),
    winston.format(info => {
      if (als && als.get()) {
        const {
          requestId, method, originalUrl,
          taskId, taskName,
          msgId, tag, topic
        } = als.get()
        return {
          ...info,
          requestId,
          method,
          originalUrl,
          taskId,
          taskName,
          msgId,
          tag,
          topic
        }
      }
      return info
    })(),
    // TODO: custom format
    winston.format.printf(info => {
      let logStr = `[${
        info.timestamp
      }/`
      if (info.requestId) {
        logStr += `request/${info.requestId}/`
      } else if (info.taskId) {
        logStr += `schedule/${info.taskId}/`
      } else if (info.msgId) {
        logStr += `amqp/${info.msgId}/`
      } else {
        logStr += 'system/'
      }
      logStr += `${info.level}]`
      if (info.method) {
        logStr += ` ${info.method}`
      }
      if (info.originalUrl) {
        logStr += ` ${info.originalUrl}`
      }

      if (info.taskName) {
        logStr += ` ${info.taskName}`
      }

      // mq
      if (info.tag) {
        logStr += ` ${info.tag}`
      }
      if (info.topic) {
        logStr += ` ${info.topic}`
      }

      if (info.message) {
        logStr += ` ${info.message}`
      }
      if (info.stack) {
        logStr += ` ${info.stack}`
      }
      return logStr
    })
  )
  if (process.env.NODE_ENV !== 'production') {
    return [new winston.transports.Console({
      format: printfFormatter
    })]
  }
  return [
    'error', 'warn', 'info'
  ].map(level => {
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
