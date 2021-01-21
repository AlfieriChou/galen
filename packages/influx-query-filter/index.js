const operators = {
  $gt: '>',
  $lt: '<',
  $gte: '>=',
  $lte: '<='
}

const parseFilter = ({
  tableName, filter, tags
}) => {
  const {
    order = 'time desc',
    limit = 20
  } = filter
  const where = JSON.parse(filter.where || '{}')
  let query = `select * from ${tableName}`
  if (Object.keys(where).length > 0) {
    Object.entries(where).forEach(([key, value]) => {
      if ([...tags, 'time'].includes(key)) {
        if (typeof value !== 'object') {
          query += ` where ${key} = '${value}'`
        } else {
          Object.entries(value).forEach(([vKey, vValue]) => {
            if (key === 'time') {
              query += ` where ${key} ${operators[vKey]} '${new Date(vValue).toISOString()}'`
            } else {
              query += ` where ${key} ${operators[vKey]} '${vValue}'`
            }
          })
        }
      } else {
        throw new Error(`${key} is not a valid property`)
      }
    })
  }
  if (order) {
    query += ` order by ${order}`
  }
  // if (offset) {
  //   query += ` offset ${offset}`
  // }
  if (limit) {
    query += ` limit ${limit}`
  }
  return query
}

module.exports = parseFilter
