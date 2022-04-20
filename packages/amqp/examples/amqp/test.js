module.exports = class Test {
  async onMsg (msg) {
    console.log('[message]: ', msg)
    console.log('----', msg.content.toString())
  }
}
