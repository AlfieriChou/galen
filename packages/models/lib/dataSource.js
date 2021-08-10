module.exports = async config => {
  return Object.entries(config)
    .reduce(async (promise, [key, { dataSource, options }]) => {
      const acc = await promise
      return {
        ...acc,
        // eslint-disable-next-line import/no-dynamic-require, global-require
        [key]: require(`../dialects/${dataSource}`).createDataSource(options)
      }
    }, Promise.resolve({}))
}
