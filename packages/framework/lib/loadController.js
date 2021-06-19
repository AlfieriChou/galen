const classLoader = require('@galenjs/class-loader')
const fs = require('fs')
const path = require('path')

module.exports = async ({
  workspace, controllerPath, plugin
}) => {
  let controller = {}
  if (controllerPath) {
    const controllerDirPath = path.join(
      workspace,
      `/${controllerPath}`
    )
    if (fs.existsSync(controllerDirPath)) {
      controller = {
        ...controller,
        ...classLoader(controllerDirPath)
      }
    }
    if (plugin) {
      await Promise.all(plugin.plugins.map(async pluginName => {
        const pluginMainPath = plugin.mainPath || 'plugins'
        const pluginControllerDirPath = path.join(
          workspace,
          `/${pluginMainPath}/${pluginName}/${controllerPath}`
        )
        if (fs.existsSync(pluginControllerDirPath)) {
          controller = {
            ...controller,
            ...classLoader(pluginControllerDirPath)
          }
        }
      }))
    }
  }
  return controller
}
