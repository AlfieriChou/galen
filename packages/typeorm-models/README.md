# `typeorm-models`

> galenjs typeorm entity schema

## Usage

```javascript
const createTypeOrmModels = require('@galenjs/typeorm-models')

const bootstrap = async () => {
  const {
    models, connections
  } = await createTypeOrmModels(schemas, {
    default: {
      host: '127.0.0.1',
      username: 'root',
      password: 'alfieri',
      database: 'test'
    },
    clients: {
      main: {}
    }
  })

  // TODO: find camelCase
  const data = await connections.get('main').getRepository(models.User).find({
    nick_name: 'test'
  })
  console.log(JSON.stringify(data, null, 2))
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

[separating-entity-definition](https://typeorm.io/#/separating-entity-definition)
[example](https://github.com/AlfieriChou/galen-demo/tree/feat/typeorm)
