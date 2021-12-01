# `swagger`

> galenjs swagger document

## Usage

### install

```bash
pnpm install @galenjs/swagger
```

### example

```javascript
const buildSwaggerDocs = require('@galenjs/swagger')

const openApiInfo = {
  title: 'galenJs API document',
  version: 'v3',
  description: 'openApi 3.0 document',
  contact: {
    name: 'AlfieriChou',
    email: 'alfierichou@gmail.com',
    url: 'https://github.com/AlfieriChou/galen/tree/master/packages/swagger'
  },
  license: {
    name: 'MIT',
    url: 'https://github.com/AlfieriChou/galen/blob/master/LICENSE'
  }
}

buildSwaggerDocs(openApiInfo, {
  schemas: ctx.jsonSchemas, remoteMethods: ctx.remoteMethods
})
```
