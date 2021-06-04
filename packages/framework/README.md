# `framework`

> galenjs framework base on Koa.

## Usage

```javascript
const Framework = require('@galenjs/framework')
const koaBody = require('koa-body')
const koaLogger = require('koa-logger')
const bodyParser = require('koa-bodyparser')

const middlewares = [koaLogger(), koaBody({}), bodyParser()]

const bootstrap = async () => {
  const framework = new Framework(config)
  await framework.init()
  freamework.app.use(...middlewares)
  await framework.loadRoutes()
  await framework.listen()
}

bootstrap()
```
