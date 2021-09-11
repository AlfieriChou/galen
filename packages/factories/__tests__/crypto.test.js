const crypto = require('crypto')

const { hash, encrypted, decrypted } = require('../crypto')

describe('crypto', () => {
  it('hash', async () => {
    const ret = hash('test')
    expect(ret).toBe('098f6bcd4621d373cade4e832627b4f6')
  })

  it('aes crypto', () => {
    const tt = 'abc'
    const iv = crypto.randomBytes(16).toString('base64')
    const key = crypto.randomBytes(16).toString('base64')
    const encryptedData = encrypted(tt, { key, iv })
    const decryptedData = decrypted(encryptedData, { key, iv })
    expect(decryptedData).toEqual(tt)
  })
})
