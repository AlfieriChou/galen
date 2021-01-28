# `influx-query-filter`

> TODO: description

## Usage

```javascript
const influxQueryFilter = require('@galenjs/influx-query-filter')

influxQueryFilter({
  filter: '{"where":{"time":{"$gt":1611818628223}},"order":"time","limit":10}',
  tableName: 'test',
  tags: ['path']
})
```

### where

- $gt: >
- $gte: >=
- $lt: <
- $lte: <=

```javascript
where: {"time":{"$gt":1611818628223}}
```

### order

```javascript
order=time desc
```

### limit

```javascript
limit=10
```

### example

```javascript
v1/responseTime?where={"time":{"$gt":1611818628223}}&order=time desc&limit=10
```
