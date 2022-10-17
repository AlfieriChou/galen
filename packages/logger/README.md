# `logger`

> galenjs logger

## install

```bash
pnpm install @galenjs/logger
```

## Usage

```javascript
const createLogger = require('@galenjs/logger');

// https://github.com/winstonjs/winston-daily-rotate-file
const logger = createLogger({
  dirname: '/logs/',
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  frequency: '5m'
}, als)
```
