const crypto = require('crypto')

exports.hash = str => crypto.createHash('md5').update(str).digest('hex')
