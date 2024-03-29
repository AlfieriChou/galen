const winston = require('winston')
require('winston-daily-rotate-file')

const createTransports = (logDir, transportConfig, als) => {
  const printFormatter = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss,SSS' }),
    winston.format(info => {
      if (als && als.get()) {
        const {
          requestId, method, originalUrl,
          taskId, taskName,
          msgId, tag, topic, jobId,
          jobName
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
          topic,
          jobId,
          jobName
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
      } else if (info.jobId) {
        logStr += `bullMq/${info.jobId}/`
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
      if (info.jobName) {
        logStr += ` ${info.jobName}`
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
      format: printFormatter
    })]
  }
  return [
    'error', 'warn', 'info'
  ].map(level => {
    return new winston.transports.DailyRotateFile({
      level,
      ...transportConfig,
      filename: `${logDir}/logs/${level === 'info' ? 'application' : level}-%DATE%.log`,
      format: printFormatter
    })
  })
}

const stringifyMsgs = msgs => {
  return msgs.map(msg => (typeof msg === 'object' ? JSON.stringify(msg) : msg))
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
      const errOptions = {}
      const err = args.find(arg => arg instanceof Error)
      if (err) {
        errOptions.stack = err.stack
      }
      const messages = args.filter(arg => !(arg instanceof Error))
      logger.log('warn', (stringifyMsgs(messages)).join(' '), errOptions)
    },
    error: (...args) => {
      const errOptions = {}
      const err = args.find(arg => arg instanceof Error)
      if (err) {
        errOptions.stack = err.stack
      }
      const messages = args.filter(arg => !(arg instanceof Error))
      logger.log('error', (stringifyMsgs(messages)).join(' '), errOptions)
    },
    info: (...args) => logger.info({
      level: 'info',
      message: (stringifyMsgs(args)).join(' ')
    })
  }
}
