const { Worker, Queue, QueueEvents } = require('bullmq')
const classLoader = require('@galenjs/class-loader')
const assert = require('assert')
const shortId = require('shortid')
const validateSchema = require('@galenjs/factories/validateJsonSchema')

module.exports = class BullMq {
  constructor ({
    config, logger, app = {}
  }) {
    validateSchema(config, {
      type: 'object',
      properties: {
        connection: {
          type: 'object',
          properties: {
            host: {
              type: 'string'
            },
            port: {
              type: 'number'
            }
          },
          required: ['host']
        },
        consumerPath: {
          type: 'string'
        },
        sub: {
          type: 'object'
        }
      },
      required: ['connection', 'sub', 'consumerPath']
    })
    this.config = config
    this.app = app
    this.logger = logger || this.app.coreLogger
    this.isSoftExit = false
    this.workers = {}
    this.queues = {}
  }

  async setup () {
    this.amqpService = classLoader(this.config.consumerPath)
    const ctx = this.app.context
    await Object.entries(this.config.sub)
      .reduce(async (promise, [key, options]) => {
        await promise
        this.logger.info('[@galenjs/bullmq] key options: ', key, options)
        const { queueName } = options
        assert(queueName, 'queueName is required')
        this.queues[queueName] = new Queue(
          queueName,
          {
            connection: this.config.connection
          }
        )
        this.workers[key] = new Worker(
          queueName,
          async job => {
            if (job.name === key) {
              const { id } = job.data
              const consumeMsg = async () => {
                const startedAt = Date.now()
                this.logger.info(`[@galenjs/bullmq] ${key} consumer start: `, id)
                try {
                  await this.amqpService[key].onMsg(job.data, ctx)
                } catch (err) {
                  this.logger.info(`[@galenjs/bullmq] ${key} consumer error: `, id, err)
                } finally {
                  this.logger.info(`[@galenjs/bullmq] ${key} consumer done: `, id, Date.now() - startedAt)
                }
              }
              if (this.app?.als) {
                await this.app.als.run({
                  msgId: id,
                  jobName: key
                }, consumeMsg)
              } else {
                await consumeMsg()
              }
            }
          }
        )
        const queueEvents = new QueueEvents(queueName)
        queueEvents.on('completed', ({ jobId }) => {
          this.logger.info('[@galenjs/bullmq] done painting', jobId)
        })
        queueEvents.on('failed', ({
          jobId, failedReason
        }) => {
          this.logger.warn('[@galenjs/bullmq] error painting', jobId, failedReason)
        })
      }, Promise.resolve())
  }

  async send (jobName, queueName, data, options = {}) {
    const queue = this.queueName[queueName]
    assert(queue, `not found queue: ${queueName}`)
    return this.queue.add(jobName, {
      id: shortId.generate(),
      data
    }, options)
  }

  async closed () {
    await Object.entries(this.workers)
      .reduce(async (promise, [name, worker]) => {
        await promise
        await worker.close()
        this.logger.info(`[@galenjs/bullmq] ${name} worker closed!`)
      }, Promise.resolve())
  }

  async softExit () {
    this.isSoftExit = true
    if (this.app?.on) {
      this.app.on('pendingCount0', async () => {
        await this.closed()
      })
    } else {
      await this.closed()
    }
  }
}
