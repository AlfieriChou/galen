# galen

## galen是什么

galen是一个低代码平台，采用sequelize模型为主，后续将会完全支持typeorm模型。

## galen为了解决什么问题

面对越来越多的同质化的需求，可以将一些相对简单的逻辑功能的复用。避免出现重复的代码，与此同时，也能精简项目的代码量。

### packages

#### 公共基础包

- 类文件加载器-[class-loader](https://github.com/AlfieriChou/galen/tree/master/packages/class-loader)
- 公用方法-[factories](https://github.com/AlfieriChou/galen/tree/master/packages/factories)
- sequelize查询语句支持-[sequelize-query-filter](https://github.com/AlfieriChou/galen/tree/master/packages/sequelize-query-filter)
- redis公用方法-[redis](https://github.com/AlfieriChou/galen/tree/master/packages/redis)
- influx查询语句支持-[influx-query-filter](https://github.com/AlfieriChou/galen/tree/master/packages/influx-query-filter)
- swagger文档-[swagger](https://github.com/AlfieriChou/galen/tree/master/packages/swagger)
- amqp-[amqp](https://github.com/AlfieriChou/galen/tree/master/packages/amqp)
- timing-[timing](https://github.com/AlfieriChou/galen/tree/master/packages/timing)

#### v1

- 模型定义基础库-[base](https://github.com/AlfieriChou/galen/tree/master/packages/base)
- sequelize模型-[sequelize-models](https://github.com/AlfieriChou/galen/tree/master/packages/sequelize-models)
- influx模型-[influx](https://github.com/AlfieriChou/galen/tree/master/packages/influx)
- [koa-router](https://github.com/AlfieriChou/galen/tree/master/packages/koa-router)
- typeorm模型-[typeorm-models](https://github.com/AlfieriChou/galen/tree/master/packages/typeorm-models)
- 框架-[framework](https://github.com/AlfieriChou/galen/tree/master/packages/framework)

##### 使用案例

[demo](https://github.com/AlfieriChou/galen-demo)

#### v2

- 基础模型-[models](https://github.com/AlfieriChou/galen/tree/master/packages/models)
- 模型路由-[models-rest](https://github.com/AlfieriChou/galen/tree/master/packages/models-rest)
- 框架-[models-rest](https://github.com/AlfieriChou/galen/tree/master/packages/framework-next)

##### 使用案例

[demo](https://github.com/AlfieriChou/galen-demo-next/tree/develop)
