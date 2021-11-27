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
  filePath, header, data = [], fields = []
}) => {
  const existFile = fs.existsSync(filePath)
  const endsWithLine = '\r\n'
  if (!existFile) {
    fs.writeFileSync(filePath, `${header}${endsWithLine}`)
  }
  // TODO: write multi line
  data.forEach(item => {
    const newLine = fields.reduce((acc, field) => ([...acc, item[field]]), [])
    fs.appendFileSync(filePath, `${newLine}${endsWithLine}`)
  })
}
