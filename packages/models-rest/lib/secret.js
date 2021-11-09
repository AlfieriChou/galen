const crypto = require('crypto')
const { decrypted } = require('@galenjs/factories/crypto')
const util = require('util')
const { format } = require('date-fns')

const generateKeyPair = util.promisify(crypto.generateKeyPair)
const ONE_DAY_SECOND = 24 * 60 * 60
const ONE_DAY = ONE_DAY_SECOND * 1000

module.exports = class Secret {
  async generateRSAKeyPair () {
    const { publicKey, privateKey } = await generateKeyPair('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: ''
      }
    })
    return {
      publicKey: Buffer.from(publicKey).toString('base64'),
      privateKey: Buffer.from(privateKey).toString('base64')
    }
  }

  decryptedData (encryptedData, options) {
    const { privateKey, encryptedKey, iv } = options
    const key = crypto.privateDecrypt({
      key: Buffer.from(privateKey, 'base64'),
      passphrase: ''
    }, Buffer.from(encryptedKey, 'base64'))
    return JSON.parse(decrypted(encryptedData, { key, iv }))
  }

  async getRSAKeys (clientId, ctx) {
    return ctx.redis.getJson('main', `RSA-keys:${clientId}`)
  }

  async setRSAKeys ({
    clientId, keys, expires = ONE_DAY_SECOND
  }, ctx) {
    return ctx.redis.setJson('main', `RSA-keys:${clientId}`, keys, expires)
  }

  async getClientId (ctx) {
    const dateStr = format(Date.now(), 'yyyyMMdd')
    const seq = await ctx.redis.incr('main', `clientIdSeq:${dateStr}`, 2 * ONE_DAY_SECOND)
    return `${
      dateStr
    }${
      (`${seq || 0}`).padStart(7, 0)
    }${
      Math.random().toString().slice(-2)
    }`
  }

  async generateRSAPublicKey (ctx) {
    const { clientId, rsaKeys } = await this.generateRSA(ctx)
    return {
      clientId,
      publicKey: rsaKeys.publicKey,
      expiresIn: Date.now() + ONE_DAY
    }
  }

  async generateRSA (ctx) {
    const clientId = await this.getClientId(ctx)
    const rsaKeys = await this.generateRSAKeyPair()
    await this.setRSAKeys({
      clientId, keys: rsaKeys
    }, ctx)
    return {
      clientId, rsaKeys
    }
  }
}
