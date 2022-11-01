const { Worker, Queue, Job } = require('bullmq')
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
    await Object.entries(this.config.sub)
      .reduce(async (promise, [key, options]) => {
        await promise
        this.logger.info('[@galenjs/bullmq] key options: ', key, options)
        const { queueName } = options
        assert(queueName, 'queueName is required')
        if (!this.queues[queueName]) {
          this.queues[queueName] = new Queue(
            queueName,
            {
              connection: this.config.connection
            }
          )
          await this.queues[queueName].waitUntilReady()
          // TODO: support options connection
          this.workers[key] = new Worker(queueName)
        }
        this.consumer(key)
      }, Promise.resolve())
  }

  // TODO: support options
  async consumer (key) {
    const ctx = this.app.context
    do {
      const job = await this.workers[key].getNextJob(key)
      if (job) {
        const { id } = job.data
        const consumeMsg = async () => {
          const startedAt = Date.now()
          try {
            this.logger.info(`[@galenjs/bullmq] ${key} consumer start: `, id)
            await this.amqpService[key].onMsg(job.data, ctx)
            const [jobData, jobId] = await job.moveToCompleted('success', key)
            if (jobData) {
              Job.fromJSON(this.workers[key], jobData, jobId)
            }
            this.logger.info(`[@galenjs/bullmq] ${key} consumer done: `, id, Date.now() - startedAt)
          } catch (err) {
            this.logger.info(`[@galenjs/bullmq] ${key} consumer error: `, id, err)
            await job.moveToFailed(new Error('failed'), key)
          }
        }
        if (this.app?.als) {
          await this.app.als.run({
            msgId: id,
            jobName: key
          }, consumeMsg)
          return
        }
        await consumeMsg()
      }
    } while (!this.isSoftExit)
  }

  async send (jobName, queueName, body, options = {}) {
    const queue = this.queues[queueName]
    assert(queue, `not found queue: ${queueName}`)
    const ret = await queue.add(jobName, {
      id: shortId.generate(),
      body
    }, options)
    return ret
  }

  async softExit () {
    this.isSoftExit = true
    await Object.entries(this.workers)
      .reduce(async (promise, [name, worker]) => {
        await promise
        await worker.close()
        this.logger.info(`[@galenjs/bullmq] ${name} worker closed!`)
      }, Promise.resolve())
  }
}
