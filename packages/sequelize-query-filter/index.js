const _ = require('lodash')
const Sequelize = require('sequelize')

const { deepMapKeys } = require('./lib')

const { Op } = Sequelize
const optAliases = {
  $eq: Op.eq,
  $ne: Op.ne,
  $gte: Op.gte,
  $gt: Op.gt,
  $lte: Op.lte,
  $lt: Op.lt,
  $not: Op.not,
  $in: Op.in,
  $notIn: Op.notIn,
  $is: Op.is,
  $like: Op.like,
  $notLike: Op.notLike,
  $iLike: Op.iLike,
  $notILike: Op.notILike,
  $regexp: Op.regexp,
  $notRegexp: Op.notRegexp,
  $iRegexp: Op.iRegexp,
  $notIRegexp: Op.notIRegexp,
  $between: Op.between,
  $notBetween: Op.notBetween,
  $overlap: Op.overlap,
  $contains: Op.contains,
  $contained: Op.contained,
  $adjacent: Op.adjacent,
  $strictLeft: Op.strictLeft,
  $strictRight: Op.strictRight,
  $noExtendRight: Op.noExtendRight,
  $noExtendLeft: Op.noExtendLeft,
  $and: Op.and,
  $or: Op.or,
  $any: Op.any,
  $all: Op.all,
  $values: Op.values,
  $col: Op.col
}

const parseIncludes = (
  { currentModelName, includeInsts },
  { models, modelDefs }
) => {
  return includeInsts.map(inst => {
    const {
      where, include, model, as
    } = inst
    if (!models[model]) {
      throw new Error(`Not found Model ${model}`)
    }
    const modelDef = modelDefs[currentModelName]
    if (where) {
      // eslint-disable-next-line no-param-reassign
      inst.where = deepMapKeys(
        _.isObject(where) ? where : JSON.parse(where),
        key => optAliases[key] || key
      )
    }
    if (include) {
      return {
        ...inst,
        model: models[model],
        separate: !!modelDef.relations[as].type === 'hasMany',
        include: parseIncludes(
          { currentModelName: model, includeInsts: include },
          { models, modelDefs }
        )
      }
    }
    return {
      ...inst,
      model: models[model],
      separate: !!modelDef.relations[as].type === 'hasMany'
    }
  })
}

module.exports = (
  { modelName, query },
  { models, modelDefs }
) => {
  const filter = {
    subQuery: false,
    distinct: true,
    offset: 0,
    limit: 10
  }
  const {
    where = {}, include, order, attributes, offset, limit
  } = query
  if (where) {
    filter.where = deepMapKeys(
      _.isObject(where) ? where : JSON.parse(where),
      key => optAliases[key] || key
    )
  }
  if (include) {
    const includes = Array.isArray(include)
      ? include.map(o => (_.isObject(o) ? o : JSON.parse(o))) : JSON.parse(include)
    filter.include = parseIncludes(
      {
        currentModelName: modelName,
        includeInsts: includes
      },
      { models, modelDefs }
    )
  }
  if (order) {
    filter.order = Array.isArray(order)
      ? order.map(o => (_.isObject(o) ? o : JSON.parse(o))) : JSON.parse(order)
  }
  if (attributes) {
    filter.attributes = Array.isArray(attributes) ? attributes : JSON.parse(attributes)
  }
  if (offset) {
    filter.offset = parseInt(offset, 10) || 0
  }
  if (limit) {
    filter.limit = parseInt(limit, 10) || 10
  }
  return filter
}
