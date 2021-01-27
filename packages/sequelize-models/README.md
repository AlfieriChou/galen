# `sequelize-models`

> galenjs sequelize models

## Usage

```javascript
const createSequelizeModels = require('@galenjs/sequelize-models')

const bootstrap = async () => {
  const db = await createSequelizeModels(schemas, {
    default: {
      host: '127.0.0.1',
      user: 'root',
      password: 'alfieri',
      database: 'test'
    },
    clients: {
      main: {}
    }
  })
}

bootstrap()
```

### 支持配置多实例

```js
{
  default: {
    host: '127.0.0.1',
    user: 'root',
    password: 'alfieri',
    database: 'test'
  },
  clients: {
    main: {},
    test: {
      database: 'test1'
    }
  }
}
```

* default为默认配置可以为空对象
* clients则是需要配置的配置实例的信息

### 安全关闭

```javascript
const createSequelizeModels = require('@galenjs/sequelize-models')

const bootstrap = () => {
  const db = await createSequelizeModels(schemas, {
    default: {
      host: '127.0.0.1',
      user: 'root',
      password: 'alfieri',
      database: 'test'
    },
    clients: {
      main: {},
      test: {
        database: 'test1'
      }
    }
  })

  // do something
  // await db.User.findAll()
  // await db.User.findOne()
  // await db.User.create()
  // await db.User.update()
  // await db.User.destroy()

  await db.quit()
}

bootstrap()
```

### 模型使用参考sequelize文档

[sequelize](https://sequelize.org/master/manual/model-querying-basics.html)
