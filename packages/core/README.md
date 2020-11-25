# `core`

> TODO: description

## Usage

```javascript
const loadModels = require('@galenjs/core')
const path = require('path')

const bootstrap = async () => {
  const {
    remoteMethods, modelSchemas, schemas
  } = await loadModels(path.join(__dirname, './model'))
}

bootstrap()
```
