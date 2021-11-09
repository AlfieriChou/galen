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

## databaseName

背景: sequelize-models支持多实例

模型数据库名称（默认为main）-仅支持sequelize models

例如

```yaml
databaseName: 'main'
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

默认使用的是mysql

- mysql-默认创建sequelize模型
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

### secretType

加密类型: client

此处只实现了客户端拿服务端公钥加密数据，然后，服务端解密数据

传值案例:

```json
{
  "iv": "pcp+MVj4zfCMNjB77le9oA==",
  "encryptedKey": "AICNw7abzCeSVR+0esubZA74iYJPHXG4Bk0SKcEJ9q5dcKLQIwbqSx0YlEHss/Q99Bh95DyMYv8VRhHIwIx/6P1LHpaOTTSOtl6Viay4R2j6Zucvoiu7oKnWs0PVRiiojhLSGNxmlGjT553gNfwpglwnkYrcmKyj/A5I5QoW6IqcURGhP/W5wrWgEqMIIJebpLrgyh+keZ3EOx6GC/68Q+EallDFpERSLulg99gTcbZaHquonKHWQFLF1QRS0U0BF70rN2Wm4AwhoLzX1y89R1/8zMxPpSxXlGOJr38CDmQbHr+2H1Az37YK3l54+WrrHQnxBkb+/6hleHKUI1Y8nw==",
  "encryptedData": "AynFEIrRXWYnDY6miD8rrGBYGXou4JNeJqrvD8WFKHuBBGwoaJeUKJ9WWcAHPBMB",
  "secretType": 1,
  "clientId": "20211109000000523"
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
