const fs = require('fs')

exports.parseCsv = csv => {
  const lines = csv.split('\n')
  const header = lines.shift().split(',')
  return lines.map(line => {
    const bits = line.split(',')
    const obj = {}
    // eslint-disable-next-line no-return-assign
    header.forEach((h, i) => obj[h] = bits[i])
    return obj
  })
}

exports.writeCsv = ({
  filePath, header, data = [], fields = [], writeLineLength = 1
}) => {
  const existFile = fs.existsSync(filePath)
  const endsWithLine = '\r\n'
  if (!existFile) {
    fs.writeFileSync(filePath, `\ufeff${header}${endsWithLine}`)
  }
  let index = 0
  while (index < data.length) {
    const lines = data.slice(index, index + writeLineLength)
    fs.appendFileSync(
      filePath,
      `${lines.map(
        line => fields.reduce((acc, field) => ([...acc, line[field]]), [])
      ).join(endsWithLine)}${endsWithLine}`
    )
    index += writeLineLength
  }
}
