class Model {}

exports.connection = () => {}

exports.buildModel = ({
  tableName, jsonSchema, modelSchema, remoteMethods
}) => class extends Model {
  static get tableName () {
    return tableName
  }

  static get jsonSchema () {
    return jsonSchema
  }

  static get modelSchema () {
    return modelSchema
  }

  static get remoteMethods () {
    return remoteMethods
  }
}
