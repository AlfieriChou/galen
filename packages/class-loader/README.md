# `class-loader`

> galenjs class loader

## Usage

```javascript
const path = require('path')
const classLoader = require('@galenjs/class-loader')

const controller = classLoader(path.resolve(__dirname, 'app/controller'))
await controller.user.create()
```
