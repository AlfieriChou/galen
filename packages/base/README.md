# `base`

- galen模型数据处理中心

## Usage

```javascript
const loadModels = require('@galenjs/base')
const path = require('path')

const bootstrap = async () => {
  const {
    remoteMethods, modelSchemas, schemas
  } = await loadModels({
    workspace: process.cwd(),
    modelPath: 'model'
  })
}

bootstrap()
```

## tableName

默认创建的表名
例如

```yaml
tableName: 't_user'
```

## modelName

默认模型名
例如

```yaml
modelName: 'User'
```

## dialect

默认使用的是mysql

- mysql-默认创建sequelize模型
- virtual-虚拟模型类型（不创建任何模型）

例如

```yaml
dialect: 'mysql'
```

## model

模型属性

例如

```yaml
model:
  id:
    type: integer
    autoIncrement: true
    primaryKey: true
  phone:
    type: string
    length: 11
    description: '手机号'
  password:
    type: string
    length: 32
    description: '密码'
  nickName:
    type: string
    length: 32
    description: '昵称'
  createdAt:
    type: date
    allowNull: false
  updatedAt:
    type: date
    allowNull: false
  deletedAt:
    type: date
    allowNull: false
```

## relations

关联关系

- belongsTo

```yaml
relations:
  role:
    type: 'belongsTo'
    model: 'Role'
```

- hasOne

- belongsToMany

```yaml
relations:
  roles:
    type: 'belongsToMany'
    model: 'Role'
    through: 'UserRole'
```

## indexes

联合索引（支持的类型是index和unique，后续在考虑接入fulltext）

例如

```yaml
indexes:
  testIndex:
    type: 'unique'
    fields:
      - phone
      - nickName
```

## remoteMethods

接口请求信息

自定义接口信息，用来生成文档和api路由

例如

```yaml
remoteMethods:
  register:
      path: '/register'
      method: 'post'
      tags:
        - user
      summary: '用户注册'
      requestBody:
        body:
          phone:
            type: string
            length: 11
            description: '手机号'
          password:
            type: string
            length: 32
            description: '密码'
        required:
          - phone
          - password
      output:
        200:
          type: 'object'
          result:
            id:
              type: integer
              autoIncrement: true
              primaryKey: true
            phone:
              type: string
              length: 11
              description: '手机号'
            password:
              type: string
              length: 32
              description: '密码'
            nickName:
              type: string
              length: 32
              description: '昵称'
            createdAt:
              type: date
              allowNull: false
            updatedAt:
              type: date
              allowNull: false
            deletedAt:
              type: date
              allowNull: false 
```
