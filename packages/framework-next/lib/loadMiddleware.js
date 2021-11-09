const fs = require('fs')
const path = require('path')
const readDirFilenames = require('read-dir-filenames')
const _ = require('lodash')

const loadMiddlewareDirToObj = async dirPath => {
  const middlewarePaths = readDirFilenames(dirPath, {
    ignore: 'index.js'
  })
  return middlewarePaths.reduce((ret, middlewarePath) => {
    const { name } = path.parse(middlewarePath)
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const middleware = require(middlewarePath)
    return {
      ...ret,
      [name]: middleware
    }
  }, {})
}

module.exports = async ({
  workspace, middlewarePath, plugin
}) => {
  const middleware = {}
  if (middlewarePath) {
    const middlewareDirPath = path.join(
      workspace,
      `/${middlewarePath}`
    )
    if (fs.existsSync(middlewareDirPath)) {
      _.merge(middleware, await loadMiddlewareDirToObj(middlewareDirPath))
    }
    if (plugin) {
      await Promise.all(plugin.plugins.map(async pluginName => {
        const pluginMainPath = plugin.mainPath || 'plugins'
        const pluginMiddlewareDirPath = path.join(
          workspace,
          `/${pluginMainPath}/${pluginName}/${middlewarePath}`
        )
        if (fs.existsSync(pluginMiddlewareDirPath)) {
          _.merge(middleware, await loadMiddlewareDirToObj(pluginMiddlewareDirPath))
        }
      }))
    }
  }
  return middleware
}
