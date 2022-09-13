# galen

## galen是什么

galen是一个低代码平台，支持json、yaml文件生成sequelize模型、influx模型，通过方法定义生成相对应的api以及swagger文档。

## galen为了解决什么

1. 高可复用性
2. 避免项目臃肿，维护困难
3. 插件化项目集成，便于抽离模块
4. 优雅的restful API维护方案
5. 可控的优雅关闭

### packages

#### 公共基础包

- 类文件加载器-[class-loader](https://github.com/AlfieriChou/galen/tree/master/packages/class-loader)
- 公用方法-[factories](https://github.com/AlfieriChou/galen/tree/master/packages/factories)
- sequelize查询语句支持-[sequelize-query-filter](https://github.com/AlfieriChou/galen/tree/master/packages/sequelize-query-filter)
- redis公用方法-[redis](https://github.com/AlfieriChou/galen/tree/master/packages/redis)
- influx查询语句支持-[influx-query-filter](https://github.com/AlfieriChou/galen/tree/master/packages/influx-query-filter)
- swagger文档-[swagger](https://github.com/AlfieriChou/galen/tree/master/packages/swagger)
- amqp-[amqp](https://github.com/AlfieriChou/galen/tree/master/packages/amqp)
- amqp-next-[amqp-next](https://github.com/AlfieriChou/galen/tree/master/packages/amqp-next)
- timing-[timing](https://github.com/AlfieriChou/galen/tree/master/packages/timing)
- 定时任务-[schedule](https://github.com/AlfieriChou/galen/tree/master/packages/schedule)
- 日志--[logger](https://github.com/AlfieriChou/galen/tree/master/packages/logger)

#### v1 (停止维护)

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
- 框架-[framework-next](https://github.com/AlfieriChou/galen/tree/master/packages/framework-next)

##### 使用案例

[demo](https://github.com/AlfieriChou/galen-demo-next/tree/develop)
