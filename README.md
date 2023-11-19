# Limited Triggered Timers
Limited Triggered Timers package allows users to create timers that trigger a certain number of times at most. For example, you can create a timer, which triggered every two seconds and it triggers 5 times at most, after the fifth trigger, the timer cleared.
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