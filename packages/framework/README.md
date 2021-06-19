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
  await framework.start()
}

bootstrap()
```

## 配置

### port

配置项目开放的端口

### workspace

项目路径

### plugins

插件系统

例如：

```javascript
plugins: ['doc']
```

### modelPath

模型相对项目路径

例如：

```javascript
modelPath: 'app/models'
```

### controllerPath

控制器相对项目路径

例如：

```javascript
controllerPath: 'app/controller'
```

### servicePath

公用方法相对项目路径

例如：

```javascript
servicePath: 'app/service'
```

### sequelize

sequelize数据模型配置，支持多实例配置

例如：

```javascript
sequelize: {
  default: {
    host: '127.0.0.1',
    user: 'root',
    password: 'alfieri',
    database: 'test'
  },
  clients: {
    main: {}
  }
}
```

### redis

redis配置，支持多实例配置

例如：

```javascript
redis: {
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

### influx

influx数据模型配置

例如：

```javascript
influx: {
  host: '127.0.0.1',
  database: 'test'
}
```

## 配置示例

```javascript
module.exports = {
  port: 4000,
  plugin: {
    mainPath: 'plugins',
    plugins: ['doc']
  },
  workspace: process.cwd(),
  modelPath: 'app/models',
  controllerPath: 'app/controller',
  servicePath: 'app/service',
  sequelize: {
    default: {
      host: '127.0.0.1',
      user: 'root',
      password: 'alfieri',
      database: 'test'
    },
    clients: {
      main: {}
    }
  },
  influx: {
    host: '127.0.0.1',
    database: 'test'
  },
  redis: {
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
}
```
