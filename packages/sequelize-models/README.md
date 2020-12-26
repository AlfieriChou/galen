# `sequelize-models`

> galenjs sequelize models

## Usage

```javascript
const createSequelizeModels = require('sequelize-models')

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
