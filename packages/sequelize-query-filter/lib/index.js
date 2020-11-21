const deepMapKeys = (data, fn) => {
  if (Array.isArray(data)) {
    return data.map(val => deepMapKeys(val, fn))
  }
  if (typeof data === 'object') {
    return Object.keys(data)
      .reduce((acc, current) => {
        const val = data[current]
        acc[fn(current)] = val !== null && typeof val === 'object' ? deepMapKeys(val, fn) : (acc[fn(current)] = val)
        return acc
      }, {})
  }
  return data
}

exports.deepMapKeys = deepMapKeys
