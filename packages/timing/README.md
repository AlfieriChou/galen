# `timing`

> galenjs timing.

## Usage

```javascript
const Timing = require('@galenjs/timing')

const timing = new Timing()

timing.start('test')
timing.end('test')

console.log('----', timing.toJSON())

timing.clear()
```
