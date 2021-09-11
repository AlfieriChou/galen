const crypto = require('crypto')

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
