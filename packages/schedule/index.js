const fs = require('fs')
const path = require('path')
const readDirFilenames = require('read-dir-filenames')
const assert = require('assert')
const { CronJob } = require('cron')
const shortId = require('shortid')

const loadScheduleDirToObj = dirPath => {
  const schedulePaths = readDirFilenames(dirPath, {
    ignore: 'index.js'
  })
  return schedulePaths.reduce((ret, schedulePath) => {
    const { name } = path.parse(schedulePath)
    return {
      ...ret,
      // eslint-disable-next-line global-require, import/no-dynamic-require
      [name]: require(schedulePath)
    }
  }, {})
}

const loadScheduleDir = scheduleDirPath => {
  if (fs.existsSync(scheduleDirPath)) {
    return loadScheduleDirToObj(scheduleDirPath)
  }
  return {}
}

const loadSchedule = ({
  workspace, schedulePath, plugin
}) => {
  let schedule = {}
  if (schedulePath) {
    schedule = {
      ...schedule,
      ...(loadScheduleDir(path.join(
        workspace,
        `/${schedulePath}`
      )))
    }
    if (plugin) {
      plugin.plugins.forEach(pluginName => {
        const pluginMainPath = plugin.mainPath || 'plugins'
        schedule = {
          ...schedule,
          ...(loadScheduleDir(path.join(
            workspace,
            `/${pluginMainPath}/${pluginName}/${schedulePath}`
          )))
        }
      })
    }
  }
  return schedule
}

module.exports = class Schedule {
  constructor (options) {
    const {
      workspace, schedulePath, plugin, app = {}
    } = options
    assert(workspace, 'workspace must be non-empty')
    assert(schedulePath, 'schedulePath must be non-empty')
    assert(plugin, 'plugin must be non-empty')
    this.schedule = loadSchedule(options)
    this.jobs = {}
    this.app = app
    this.logger = this.app.coreLogger || console
  }

  async runTask ({
    taskName, taskId, taskFunc
  }, ctx) {
    const startedAt = Date.now()
    this.logger.info(`${taskName} start: `, taskId)
    await taskFunc(ctx)
    this.logger.info(`${taskName} done: `, taskId, Date.now() - startedAt)
  }

  async init (ctx = {}) {
    await Object.entries(this.schedule)
      .reduce(async (promise, [key, { schedule, task }]) => {
        await promise
        this.logger.info(`[@galenjs/schedule] start ${key} schedule`)
        const job = new CronJob(
          schedule.time,
          async () => {
            const taskId = shortId.generate()
            const runTaskContext = {
              taskId,
              taskName: key,
              taskFunc: task
            }

            if (this.app.als) {
              await this.aap.als.run(runTaskContext, async () => {
                await this.runTask(runTaskContext, ctx)
              })
              return
            }

            await this.runTask(runTaskContext, ctx)
          }
        )
        this.jobs[key] = job
        job.start()
        this.logger.info(`[@galenjs/schedule] start ${key} schedule done`)
      }, Promise.resolve())
  }

  async softExit () {
    await Object.entries(this.jobs)
      .reduce(async (promise, [key, job]) => {
        await promise
        this.logger.info(`[@galenjs/schedule] wait close ${key} schedule`)
        await job.stop()
        this.logger.info(`[@galenjs/schedule] closed ${key} schedule`)
      }, Promise.resolve())
  }
}
