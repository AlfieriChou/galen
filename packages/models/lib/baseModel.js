const readOnly = { enumerable: false, writable: false }

module.exports = (Model, dataSource, {
  modelDef, jsonSchema
}) => {
  Object.defineProperties(Model, {
    dataSource: { value: dataSource, ...readOnly },
    modelName: { value: modelDef.modelName, ...readOnly },
    jsonSchema: { value: jsonSchema, ...readOnly },
    modelDef: { value: modelDef, ...readOnly }
  })
}
