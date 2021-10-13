const fs = require('fs')
const path = require('path')
const readDirFilenames = require('read-dir-filenames')
const assert = require('assert')
const { CronJob } = require('cron')

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
      workspace, schedulePath, plugin, logger = console
    } = options
    assert(workspace, 'workspace must be non-empty')
    assert(schedulePath, 'schedulePath must be non-empty')
    assert(plugin, 'plugin must be non-empty')
    this.schedule = loadSchedule(options)
    this.jobs = {}
    this.logger = logger
  }

  async init () {
    await Object.entries(this.schedule)
      .reduce(async (promise, [key, { schedule, task }]) => {
        await promise
        // TODO: task support context
        this.jobs[key] = new CronJob(schedule.time, task)
        this.jobs[key].start()
      }, Promise.resolve())
  }

  async softExit () {
    await Object.entries(this.jobs)
      .reduce(async (promise, [key, job]) => {
        await promise
        this.logger.info(`[@galenjs/redis] wait close ${key} schedule`)
        await job.stop()
        this.logger.info(`[@galenjs/redis] closed ${key} schedule`)
      }, Promise.resolve())
  }
}
