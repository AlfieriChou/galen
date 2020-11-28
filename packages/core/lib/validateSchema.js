const { Validator } = require('jsonschema')

const v = new Validator()

module.exports = async (data, schema) => {
  const ret = await v.validate(data, schema)
  if (ret.errors.length > 0) {
    const errMsg = ret.errors.reduce((acc, error, index) => ([
      ...acc,
      `${index + 1}: ${error.message}`
    ]), []).join()
    throw new Error(errMsg)
  }
}
