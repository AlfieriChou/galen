const crypto = require('node:crypto')

exports.hash = str => crypto.createHash('md5').update(str).digest('hex')

exports.decrypted = (encryptedData, {
  algorithm = 'aes-128-cbc', key, iv
}) => {
  const bufferData = Buffer.from(encryptedData, 'base64').toString('binary')
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(key, 'base64'),
    Buffer.from(iv, 'base64')
  )
  decipher.setAutoPadding(true)
  let decoded = decipher.update(bufferData, 'binary', 'utf8')
  decoded += decipher.final('utf8')
  return decoded
}

exports.encrypted = (data, {
  algorithm = 'aes-128-cbc', key, iv
}) => {
  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(key, 'base64'),
    Buffer.from(iv, 'base64')
  )
  let ret = cipher.update(data, 'utf8', 'binary')
  ret += cipher.final('binary')
  return Buffer.from(ret, 'binary').toString('base64')
}

const sortObject = o => {
  if (Array.isArray(o)) { return o.sort() }
  if (!o || typeof o !== 'object') {
    return o
  }
  const keys = Object.keys(o)
  return keys.sort().map(
    key => [key, sortObject(o[key])]
  )
}

const updateData = (hash, data, encoding = 'utf8') => {
  const isBuffer = Buffer.isBuffer(data)
  let toUpdateData = data
  if (!isBuffer && typeof data === 'object') {
    toUpdateData = JSON.stringify(sortObject(data))
  }
  return hash.update(toUpdateData, isBuffer ? 'binary' : encoding)
}

exports.sortObject = sortObject

exports.base64 = (str, encoding = 'utf8') => {
  return Buffer.from(str, encoding).toString('base64')
}

exports.hmac = (key, data, algorithm = 'sha256', format = 'hex') => {
  return updateData(
    crypto.createHmac(algorithm, key),
    data
  ).digest(format)
}
