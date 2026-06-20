# Limited Triggered Timers
Limited Triggered Timers package allows users to create timers that trigger a certain number of times at most. For example, you can create a timer, which triggered every two seconds and it triggers 5 times at most, after the fifth trigger, the timer cleared.
**NOTE:** This package benefit setTimeout and setInterval functions.
## Install
```sh
npm install limited-triggered-timers
```
## Usage
#### Example 1
```js
/* Example 1
   Run a timer which calls its callback every 2 seconds at most 5 times.
   After 5th trigger, timer clears itself.   
*/
const limitedTriggeredTimers = require("limited-triggered-timers")
let counter = { val: 0 }
// Increase counter value every 2 seconds at most 3 times
let closeTimer1 = limitedTriggeredTimers.runLimitedTriggeredTimer(() => {
  counter.val += 1
  console.log("Current counter val:", counter.val) // Outputs counter.val value
},
  {
    timeIntervalMs: 2000,
    totalTriggerCount: 3,
    onFinished: () => {
      // After all triggers finished onFinished callback called.
      console.log("Timer cleared.")
    }

  })

//You can clear this timer by using closeTimer1 function before 5th trigger.
//closeTimer1()
```
#### Example 2
```js
/* Example 2
  Run a timer which calls its callback every 0.5 seconds at most 7 times
  ,and triggered manually via next function.
  You must call next function for triggering next trigger.
  After next() function called next trigger starts after the time which is specified in options.timeIntervalMs .
*/

const limitedTriggeredTimers = require("limited-triggered-timers")
let fs = require("fs")
let currentPosition = 0


fs.open('example.txt', 'r', function (status, fd) {
  if (status) {
    console.log(status.message);
    return;
  }
  // Read one byte of a file every 0.5 seconds at most 7 times.
  let closeTimer2 = limitedTriggeredTimers.runLimitedTriggeredTimerManually(
    (next) => {

      var buffer = Buffer.alloc(1);
      fs.read(fd, buffer, 0, 1, currentPosition, function (err, num) {
        console.log(buffer.toString('utf8', 0, num));
        currentPosition = currentPosition + num
        // Start next trigger after specific time(options.timeIntervalMs) via next function
        next()
      });
    }, {
    timeIntervalMs: 500,
    totalTriggerCount: 7,
    onFinished: () => { // After all triggers finished onFinished callback called.
      fs.close(fd)
    }
  })

  /*
  You can clear this timer by using closeTimer2 function before 7th trigger.
  closeTimer2()
*/

},)
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
* First release, all features added
### 2.0.0
* Typescript support added.
* Breaking change: **totalTriggerCount** option doesn't get default options when this value is smaller than 0 and not equal to -1. Instead, the user gets Error.
* Breaking change: **timeIntervalMs** option doesn't get default options when these values smaller than 0. Instead, the user gets Error.
