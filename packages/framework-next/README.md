# `framework-next`

> galenjs framework

## config-项目基础配置

* models - 数据库资源基础配置

```javascript
{
  main: {
    dataSource: 'sequelize',
    options: {
      host: '127.0.0.1',
      user: 'root',
      password: 'alfieri',
      database: 'test'
    }
  },
  virtual: {
    dataSource: 'virtual',
    options: {}
  }
}
```

* middlewarePath - 中间件配置路径
* servicePath - 项目公用方法路径 （可使用context中的service属性）
* plugins - 插件系统配置

```javascript
{
  ...
  plugins: [{
    name: 'doc',
    path: path.join(process.cwd(), 'plugins/doc')
  }]
}
```

* logger-日志配置信息

```javascript
{
  logDir: `${process.cwd()}/logs`
}
```

* redis - redis配置

```javascript
{
  default: {
    host: '127.0.0.1',
    port: 6379,
    password: '',
    db: 2
  },
  clients: {
    main: {
      keyPrefix: 'main'
    }
  }
}
```

* pyroscope - pyroscope配置

```javascript
{
  serverAddress: 'http://127.0.0.1:4040',
  appName: 'app_name'
}
```

* port - 端口配置

## Usage

```javascript
const koaBody = require('koa-body')
const koaLogger = require('koa-logger')
const bodyParser = require('koa-bodyparser')
const Framework = require('@galenjs/framework-next')
const compose = require('koa-compose')

const bootstrap = async () => {
  const framework = new Framework(config)
  await framework.init()
  framework.app.use(compose([
    koaLogger(),
    koaBody({}),
    bodyParser()
  ]))
  await framework.loadMiddleware([
    'errorHandler', 'cors', 'jwtVerify', 'auth', 'router'
  ])
  await framework.start()
}

bootstrap()
```

使用案例[demo](https://github.com/AlfieriChou/galen-demo-next/tree/develop)
