# `models`

- galen模型数据处理中心

## Usage

```javascript
const loadModels = require('@galenjs/models')
const path = require('path')

const bootstrap = async () => {
  const {
    remoteMethods, modelDefs, jsonSchemas, dataSources, models
  } = await loadModels({
    workspace: process.cwd(),
    modelPath: './models',
    modelDefPath: './modelDefs',
    datasources: {
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
  })
}

bootstrap()
```

## dataSource

数据源

例如

```yaml
dataSource: 'main'
```

## tags

背景: 支持influx

模型标签-influx

例如

```yaml
tags: ['host']
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

默认使用的是sequelize

- sequelize
- virtual-虚拟模型类型（不创建任何模型）
- influx

例如

```yaml
dialect: 'mysql'
```

## properties

模型属性

例如

```yaml
properties:
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

### path

接口路径，可以默认添加prefix

### responseType

数据返回类型

1. origin - 不对结果进行处理

2. normal - 返回标准开放API格式数据

```javascript
{
  "code": 0,
  "message": "",
  "data": {}
}
```


### method

接口方法，get,post,put,delete,patch,head

### 标签接口分类tags

例如

```yaml
tags:
  - user
```

### 接口描述-summary

### query

请求query参数
例如

```yaml
query:
  filter:
    type: string
    description: '查询参数'
```

### requestBody

请求体
例如

```yaml
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
```

### params

例如

```yaml
query:
  id:
    type: string
    description: 'id'
```

### output

返回结果
例如

```yaml
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

output支持model
例如

```yaml
output:
  200:
    type: 'object'
    model: 'User'
```
