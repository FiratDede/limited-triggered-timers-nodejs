let isNotANumber = (val) => (typeof val !== 'number') || (!isFinite(val))


let giveDefaultValuesToOptions = (options) => {
    return {
        totalTriggerCount: isNotANumber(options.totalTriggerCount) || (options.totalTriggerCount <= 0 && options.totalTriggerCount !== -1) ? 1 : (options.totalTriggerCount || 1),
        timeIntervalMs:
            isNotANumber(options.timeIntervalMs) || (options.timeIntervalMs < 0) ? 1000 : options.timeIntervalMs || 1000,
        onFinished: options.onFinished || (() => { })
    }
}

/**
 * function to run a limited triggered timer. 
 * @param {() => void} callback - The callback to be called in every time interval.
 * @param {object} options - The options object which includes timer options.
 *  @param {number} options.totalTriggerCount - A numeric value that shows how many times timer triggers the callback argument. If it is -1, callback is triggerred forever. If this number is not equal to -1 and not bigger than 0, it is set as 1
 *  @param {number} options.timeIntervalMs - A positive integer that how often the callback is called.(e.g every 100 ms, every 5000 ms ..etc). If this value is not positive number, it is set as 1000 ms 
 *  @param  {() => void}  options.onFinished - A function to be called all triggers finished.
 * @returns {function} A function when called clears the timer.
 * @example
 * // Example 1
 * // Run a timer which calls its callback every 2 seconds at most 5 times.
 * // After 5th trigger, timer clears itself.   
 * const limitedTriggeredTimers = require("limited-triggered-timers")
 * let counter = { val: 0 }
 * // Increase counter value every 2 seconds at most 3 times
 * let closeTimer1 = limitedTriggeredTimers.runLimitedTriggeredTimer(
 * () => {
 *  counter.val += 1
 *  console.log("Current counter val:", counter.val) // Outputs counter.val value
 * },
 *  {
 *    timeIntervalMs: 2000,
 *    totalTriggerCount: 3,
 *    onFinished: () => {
 *      // After all triggers finished onFinished callback called.
 *     console.log("Timer cleared.")
 *    }
 *
 *  })
 * //You can clear this timer by using closeTimer1 function before 5th trigger.
 * //closeTimer1()
*/
function runLimitedTriggeredTimer(callback = () => { }, options = { totalTriggerCount: 1, timeIntervalMs: 1000, onFinished: () => { } },) {
    let counter = 0

    let currentInterval = undefined

    options = giveDefaultValuesToOptions(options)

    currentInterval = setInterval(() => {
        callback()
        counter = counter + 1

        if (counter >= options.totalTriggerCount && options.totalTriggerCount !== -1) {
            clearInterval(currentInterval)
            // console.log("Finished")
            options.onFinished()
        }

    }, options.timeIntervalMs)



    return () => {
        clearInterval(currentInterval)
    }

}

/**
 * function to run a limited triggered timer which is triggered manually by calling next function. You must call next function for starting next trigger. After calling next function, trigger starts after some specific time (options.timeIntervalMs).
 * @param {(next) => void} callback - The callback to be called in every time interval. This callback gets next function as an argument. When you call next function, the other trigger will start after some specific time which is specified in options.timeIntervalMs val
 * @param {object} options - The options object which includes timer options.
 *  @param {number} options.totalTriggerCount - A numeric value that shows how many times timer triggers the callback argument. If it is -1, callback is triggerred forever. If this number is not equal to -1 and not bigger than 0, it is set as 1
 *  @param {number} options.timeIntervalMs - A positive integer that how often the callback is called.(e.g every 100 ms, every 5000 ms ..etc). If this value is not positive number, it is set as 1000 ms 
 *  @param  {() => void}  options.onFinished - A function to be called all triggers finished.
 * @returns {function} A function when called clears the timer.
 * @example
 * //Example 2
 * //Run a timer which calls its callback every 0.5 seconds at most 7 times
 * // ,and triggered manually via next function.
 * // You must call next function for triggering next trigger.
 * // After next() function called next trigger starts after the time which is specified in options.timeIntervalMs .
 * const limitedTriggeredTimers = require("limited-triggered-timers")
 * let fs = require("fs")
 * let currentPosition = 0
 *  fs.open('example.txt', 'r', function (status, fd) {
 * if (status) {
 *   console.log(status.message);
 *   return;
 * }
 * // Read one byte of a file every 0.5 seconds at most 7 times.
 * let closeTimer2 = limitedTriggeredTimers.runLimitedTriggeredTimerManually(
 *   (next) => {
 *      var buffer = Buffer.alloc(1);
 *     fs.read(fd, buffer, 0, 1, currentPosition, function (err, num) {
 *        console.log(buffer.toString('utf8', 0, num));
 *       currentPosition = currentPosition + num
 *       // Start next trigger after specific time(options.timeIntervalMs) via next function
 *       next()
 *     });
 *   }, {
 *   timeIntervalMs: 500,
 *   totalTriggerCount: 7,
 *   onFinished: () => { 
 *     // After all triggers finished onFinished callback called.
 *     fs.close(fd)
 *   }
 * })
 *
 * // Clear this timer using closeTimer2 function before 7th trigger.
 * //closeTimer2()
 * },)
*/

function runLimitedTriggeredTimerManually(callback = (next) => { }, options = { totalTriggerCount: 1, timeIntervalMs: 1000, onFinished: () => { } },) {
    let counter = 0

    let currentTimeout = undefined

    options = giveDefaultValuesToOptions(options)

    let next = () => {
        counter = counter + 1

        if (counter < options.totalTriggerCount || options.totalTriggerCount === -1) {
            currentTimeout = setTimeout(() => callback(next), options.timeIntervalMs)
        }
        else if (counter >= options.totalTriggerCount) {
            // console.log("Finished")
            options.onFinished()
        }
    }
    currentTimeout = setTimeout(() => callback(next), options.timeIntervalMs)

    return () => {
        clearTimeout(currentTimeout)
    }

}

module.exports = { runLimitedTriggeredTimer, runLimitedTriggeredTimerManually }