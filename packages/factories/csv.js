exports.parseCsv = (csv) => {
  const lines = csv.split('\n')
  const header = lines.shift().split(',')
  return lines.map((line) => {
    const bits = line.split(',')
    const obj = {}
    // eslint-disable-next-line no-return-assign
    header.forEach((h, i) => obj[h] = bits[i])
    return obj
  })
}
