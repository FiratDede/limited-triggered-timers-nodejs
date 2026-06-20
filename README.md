# Limited Triggered Timers

Limited Triggered Timers lets you create timers that run a callback a limited number of times. For example, you can create a timer that runs every two seconds and stops after three triggers.

**Note:** This package uses `setTimeout` and `setInterval`.

## Install

```sh
npm install limited-triggered-timers
```

## Usage

### Example 1

Run a timer that calls its callback every 2 seconds, up to 3 times. After the third trigger, the timer clears itself.

```js
const limitedTriggeredTimers = require("limited-triggered-timers")

const counter = { val: 0 }

const closeTimer1 = limitedTriggeredTimers.runLimitedTriggeredTimer(
  () => {
    counter.val += 1
    console.log("Current counter value:", counter.val)
  },
  {
    timeIntervalMs: 2000,
    totalTriggerCount: 3,
    onFinished: () => {
      console.log("Timer cleared.")
    }
  }
)

// You can clear this timer before the third trigger.
// closeTimer1()
```

### Example 2

Run a manual timer that reads one byte from a file every 0.5 seconds, up to 7 times. The next trigger is scheduled only after `next()` is called.

```js
const fs = require("fs")
const limitedTriggeredTimers = require("limited-triggered-timers")

let currentPosition = 0

fs.open("example.txt", "r", (err, fd) => {
  if (err) {
    console.log(err.message)
    return
  }

  const closeTimer2 = limitedTriggeredTimers.runLimitedTriggeredTimerManually(
    (next) => {
      const buffer = Buffer.alloc(1)

      fs.read(fd, buffer, 0, 1, currentPosition, (readErr, bytesRead) => {
        if (readErr) {
          console.log(readErr.message)
          next()
          return
        }

        console.log(buffer.toString("utf8", 0, bytesRead))
        currentPosition += bytesRead

        // Schedule the next trigger after options.timeIntervalMs.
        next()
      })
    },
    {
      timeIntervalMs: 500,
      totalTriggerCount: 7,
      onFinished: () => {
        fs.close(fd, () => {})
      }
    }
  )

  // You can clear this timer before the seventh trigger.
  // closeTimer2()
})
```

## API

### `runLimitedTriggeredTimer(callback, options)`

Runs a timer that automatically calls `callback` at a fixed interval. The timer stops after it reaches `options.totalTriggerCount`, unless `totalTriggerCount` is `-1`.

#### Parameters

- `callback`: Function called on every timer trigger.
- `options`: Optional configuration object.

#### Options

- `timeIntervalMs`: Time between each trigger in milliseconds. Default is `1000`.
- `totalTriggerCount`: Maximum number of times the callback will be triggered. Default is `1`. Use `-1` to run forever.
- `onFinished`: Function called once after the timer reaches `totalTriggerCount`.

#### Returns

Returns a function that clears the timer when called.

### `runLimitedTriggeredTimerManually(callback, options)`

Runs a timer that waits for the callback to call `next()` before scheduling the next trigger. This is useful when each trigger contains asynchronous work and the next trigger should not start until that work is finished.

#### Parameters

- `callback`: Function called on every trigger. It receives a `next` function as its first argument.
- `options`: Optional configuration object.

#### Options

- `timeIntervalMs`: Time to wait before each trigger in milliseconds. Default is `1000`.
- `totalTriggerCount`: Maximum number of times the callback will be triggered. Default is `1`. Use `-1` to run forever.
- `onFinished`: Function called once after the timer reaches `totalTriggerCount`.

#### Returns

Returns a function that clears the timer when called.

## Releases

### 1.2.0

- First release with all features added.

### 2.0.0

- Added TypeScript support.
- Breaking change: `totalTriggerCount` now throws an error when it is less than or equal to `0`, unless it is `-1`.
- Breaking change: `timeIntervalMs` now throws an error when it is less than or equal to `0`.
