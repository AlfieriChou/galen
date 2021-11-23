const classLoader = require('@galenjs/class-loader')
const fs = require('fs')
const path = require('path')

module.exports = async ({
  workspace, servicePath, plugins
}) => {
  let service = {}
  if (servicePath) {
    const serviceDirPath = path.join(workspace, `${servicePath}`)
    if (fs.existsSync(serviceDirPath)) {
      service = {
        ...service,
        ...classLoader(serviceDirPath)
      }
    }
    if (plugins && plugins.length) {
      await Promise.all(plugins.map(async plugin => {
        const pluginServiceDirPath = path.join(plugin.path, `${servicePath}`)
        if (fs.existsSync(pluginServiceDirPath)) {
          service = {
            ...service,
            ...classLoader(pluginServiceDirPath)
          }
        }
      }))
    }
  }
  return service
}
