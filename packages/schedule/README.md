# `schedule`

> TODO: description

## Usage

```javascript
// index.js
const Schedule = require('./')

const schedule = new Schedule({
  workspace: process.cwd(),
  schedulePath: 'schedule',
  plugins: [],
  app: this.app
})
schedule.init()
setTimeout(() => schedule.softExit(), 200000)

// test.js
exports.schedule = {
  time: '0 * * * * *'
}

exports.task = () => {
  console.log('Time:', Date.now())
}
```
