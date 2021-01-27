# `sequelize-query-filter`

> galenjs sequelize query filter

## Usage

```javascript
const sequelizeQueryFilter = require('@galenjs/sequelize-query-filter')
/***
  * @param {object} query
  * @param {object} query.where 搜索条件 {"name":{"$like": "%abc%"}}
  * @param {array} query.include 关联关系 [{"model":"UserRole","include":[{"model":"Role"}]}]
  * @param {number} query.limit 条数限制 10
  * @param {number} query.offset 偏移量 0
  * @param {array} query.order 排序 [["createdAt", "desc"]]
  * @param {object} models sequelize models
*/
sequelizeQueryFilter(query, models)
```

## where

- $eq: Sequelize.Op.eq
- $ne: Sequelize.Op.ne
- $gte: Sequelize.Op.gte
- $gt: Sequelize.Op.gt
- $lte: Sequelize.Op.lte
- $lt: Sequelize.Op.lt
- $not: Sequelize.Op.not
- $in: Sequelize.Op.in
- $notIn: Sequelize.Op.notIn
- $is: Sequelize.Op.is
- $like: Sequelize.Op.like
- $notLike: Sequelize.Op.notLike
- $iLike: Sequelize.Op.iLike
- $notILike: Sequelize.Op.notILike
- $regexp: Sequelize.Op.regexp
- $notRegexp: Sequelize.Op.notRegexp
- $iRegexp: Sequelize.Op.iRegexp
- $notIRegexp: Sequelize.Op.notIRegexp
- $between: Sequelize.Op.between
- $notBetween: Sequelize.Op.notBetween
- $overlap: Sequelize.Op.overlap
- $contains: Sequelize.Op.contains
- $contained: Sequelize.Op.contained
- $adjacent: Sequelize.Op.adjacent
- $strictLeft: Sequelize.Op.strictLeft
- $strictRight: Sequelize.Op.strictRight
- $noExtendRight: Sequelize.Op.noExtendRight
- $noExtendLeft: Sequelize.Op.noExtendLeft
- $and: Sequelize.Op.and
- $or: Sequelize.Op.or
- $any: Sequelize.Op.any
- $all: Sequelize.Op.all
- $values: Sequelize.Op.values
- $col: Sequelize.Op.col

```javascript
where={"nickname":{"$like":"%abc%"}}
```

## order

```javascript
order=[["createdAt", "desc"]]
```

## include

- model
- as
- where
- order
- include

```javascript
include=[{"model":"UserRole","include":[{"model":"Role"}]}]
```

## limit - default 20

```javascript
limit=20
```

## offset - default 0

```javascript
offset=0
```

## example

```javascript
v1/users?where={"nickname":{"$like":"%abc%"}}&offset=0&limit=10&order=[["createdAt", "desc"]]&include=[{"model":"UserRole","include":[{"model":"Role"}]}]
```
