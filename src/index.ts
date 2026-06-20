
 export type RunLimitedTriggeredTimerOptions = {
    totalTriggerCount?: number,
    timeIntervalMs?: number,
    onFinished?: () => void

}
/**
 * function to run a limited triggered timer. 
 * @param {() => void} callback - The callback to be called in every time interval.
 *  @typedef {RunLimitedTriggeredTimerOptions} options - The options object which includes timer options.
 *  @param {number}  [options.totalTriggerCount=1] - Default: 1. A numeric value that shows how many times timer triggers the callback argument. If it is -1, callback is triggerred forever.
 * @throws {Error} totalTriggerCount smaller or equal to 0 and not equal to -1
*  @param {number}  [options.timeIntervalMs=1000] - Default: 1000. A positive integer that how often the callback is called.(e.g every 100 ms, every 5000 ms ..etc). If this value is not bigger than 0, throws Error
* @throws {Error} timeIntervalMs smaller than 0
* @param {() => void} [options.onFinished = ()=>{}] - A function called when all triggers finished
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
export function runLimitedTriggeredTimer(callback: () => void = () => { }, { totalTriggerCount= 1, timeIntervalMs= 1000, onFinished= () => {} } :
 RunLimitedTriggeredTimerOptions = {} )
    : VoidFunction {
    let counter: number = 0

    let currentInterval: NodeJS.Timeout | undefined = undefined

    // let { totalTriggerCount, timeIntervalMs, onFinished }: RunLimitedTriggeredTimerOptions = options;


    if (!Number.isInteger(totalTriggerCount)) {
        throw new Error("totalTriggerCount must be integer.");
    }
    if (totalTriggerCount <= 0 && totalTriggerCount !== -1) {
        throw new Error("totalTriggerCount must be bigger than 0 or equal to -1.");
    }

    if (!Number.isInteger(timeIntervalMs)) {
        throw new Error("timeIntervalMs must be a positive integer.");
    }
    if (timeIntervalMs <= 0) {
        throw new Error("timeIntervalMs must be bigger than 0.");
    }

    currentInterval = setInterval(() => {
        callback()
        counter = counter + 1

        if (counter >= totalTriggerCount && totalTriggerCount !== -1) {
            clearInterval(currentInterval)
            onFinished()
        }

    }, timeIntervalMs)



    return () => {
        clearInterval(currentInterval)
    }

}

/**
 * function to run a limited triggered timer which is triggered manually by calling next function. You must call next function for starting next trigger. After calling next function, trigger starts after some specific time (options.timeIntervalMs).
 * @param {(next) => void} callback - The callback to be called in every time interval. This callback gets next function as an argument. When you call next function, the other trigger will start after some specific time which is specified in options.timeIntervalMs val
 *  @typedef {RunLimitedTriggeredTimerOptions} options - The options object which includes timer options.
 *  @param {number}  [options.totalTriggerCount=1] - Default: 1. A numeric value that shows how many times timer triggers the callback argument. If it is -1, callback is triggerred forever.
 * @throws {Error} totalTriggerCount smaller or equal to 0 and not equal to -1
*  @param {number}  [options.timeIntervalMs=1000] - Default: 1000. A positive integer that how often the callback is called.(e.g every 100 ms, every 5000 ms ..etc). If this value is not bigger than 0, throws Error
* @throws {Error} timeIntervalMs smaller than 0
* @param {() => void} [options.onFinished = ()=>{}] - A function called when all triggers finished
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

export function runLimitedTriggeredTimerManually(callback: (next: VoidFunction) => void = () => { }, { totalTriggerCount= 1, timeIntervalMs= 1000, onFinished= () => {} } :
 RunLimitedTriggeredTimerOptions = {}): VoidFunction {
    let counter: number = 0

    let currentTimeout: NodeJS.Timeout | undefined = undefined
    let closed: boolean = false
    let finished: boolean = false
    let waitingForNext: boolean = false

    if (!Number.isInteger(totalTriggerCount)) {
        throw new Error("totalTriggerCount must be integer.");
    }
    if (totalTriggerCount <= 0 && totalTriggerCount !== -1) {
        throw new Error("totalTriggerCount must be bigger than 0 or equal to -1.");
    }

    if (!Number.isInteger(timeIntervalMs)) {
        throw new Error("timeIntervalMs must be a positive integer.");
    }
    if (timeIntervalMs <= 0) {
        throw new Error("timeIntervalMs must be bigger than 0.");
    }

    const finish = () => {
        if (finished || closed) {
            return
        }
        finished = true
        closed = true
        onFinished()
    }

    const scheduleNext = () => {
        currentTimeout = setTimeout(() => {
            if (closed || finished) {
                return
            }
            waitingForNext = true
            callback(next)
        }, timeIntervalMs)
    }

    const next = () => {
        if (closed || finished || !waitingForNext) {
            return
        }

        waitingForNext = false
        counter = counter + 1

        if (counter < totalTriggerCount || totalTriggerCount === -1) {
            scheduleNext()
        }
        else if (counter >= totalTriggerCount) {
            finish()
        }
    }
    scheduleNext()

    return () => {
        closed = true
        clearTimeout(currentTimeout)
    }

}
