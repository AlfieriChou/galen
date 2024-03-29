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
  workspace, schedulePath, plugins
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
    if (plugins) {
      plugins.forEach(plugin => {
        schedule = {
          ...schedule,
          ...(loadScheduleDir(path.join(plugin.path, `${schedulePath}`)))
        }
      })
    }
  }
  return schedule
}

module.exports = class Schedule {
  constructor (options) {
    const {
      workspace, schedulePath, plugins, app = {}
    } = options
    assert(schedulePath, 'schedulePath must be non-empty')
    this.schedules = loadSchedule({
      workspace: workspace || app.workspace,
      schedulePath,
      plugins: plugins || app.plugins
    })
    this.jobs = {}
    this.app = app
    this.logger = this.app.coreLogger || console
  }

  async init (ctx = {}) {
    const { als } = this.app
    await Object.entries(this.schedules)
      .reduce(async (promise, [key, { schedule, task }]) => {
        await promise
        this.logger.info(`[@galenjs/schedule] ${key} setup schedule start`)
        const job = new CronJob(
          schedule.time,
          async () => {
            const taskId = shortId.generate()
            const runTaskContext = {
              taskId,
              taskName: key
            }

            if (als) {
              await als.run(runTaskContext, async () => {
                await task(ctx)
              })
              return
            }

            await task(ctx)
          }
        )
        this.jobs[key] = job
        job.start()
        this.logger.info(`[@galenjs/schedule] ${key} setup schedule done`)
      }, Promise.resolve())
  }

  async runScheduleByName (name, ctx) {
    await this.runSchedule({ name }, ctx)
  }

  async runSchedule ({
    name, args = []
  }, ctx) {
    const schedule = this.schedules[name]
    if (!schedule) {
      this.logger.info(`[@galenjs/schedule]: ${name} not found schedule`)
      return
    }
    try {
      const { task } = schedule
      this.logger.info(`[@galenjs/schedule]: ${name} run schedule start`)
      await task(ctx, ...args)
      this.logger.info(`[@galenjs/schedule]: ${name} run schedule done`)
    } catch (err) {
      this.logger.info(`[@galenjs/schedule]: ${name} run schedule error: `, err)
    }
  }

  async softExit () {
    await Object.entries(this.jobs)
      .reduce(async (promise, [key, job]) => {
        await promise
        this.logger.info(`[@galenjs/schedule] ${key} wait close schedule`)
        await job.stop()
        this.logger.info(`[@galenjs/schedule] ${key} closed schedule`)
      }, Promise.resolve())
  }
}
