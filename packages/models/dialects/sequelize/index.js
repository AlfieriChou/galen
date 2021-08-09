const { Sequelize } = require('sequelize')

exports.createDataSource = options => new Sequelize(options)
