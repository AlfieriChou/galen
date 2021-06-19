const classLoader = require('@galenjs/class-loader')
const fs = require('fs')
const path = require('path')

module.exports = async ({
  workspace, servicePath, plugin
}) => {
  let service = {}
  if (servicePath) {
    const serviceDirPath = path.join(
      workspace,
      `/${servicePath}`
    )
    if (fs.existsSync(serviceDirPath)) {
      service = {
        ...service,
        ...classLoader(serviceDirPath)
      }
    }
    if (plugin) {
      await Promise.all(plugin.plugins.map(async pluginName => {
        const pluginMainPath = plugin.mainPath || 'plugins'
        const pluginServiceDirPath = path.join(
          workspace,
          `/${pluginMainPath}/${pluginName}/${servicePath}`
        )
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
