const isObject = value => typeof value === 'object' && !Array.isArray(value)

const flatObject = obj => {
  if (!isObject(obj)) {
    throw new Error('flat must be object')
  }
  return Object.entries(obj)
    .reduce((acc, [key, value]) => {
      if (isObject(value)) {
        return flatObject(value)
      }
      return {
        ...acc,
        [key]: value
      }
    }, {})
}

exports.flatObject = flatObject
