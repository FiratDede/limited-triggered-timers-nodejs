const chai = require('chai');
const sinon = require('sinon');
const expect = chai.expect;


const limitedTriggeredTimer = require('../index'); 

describe('Limited Triggered Timers package', () => {
    it('should run limited triggered timers correctly.', () => {
        let obj = { val: 0 }

        limitedTriggeredTimer.runLimitedTriggeredTimer(() => {
            obj.val += 1

        }, {
            timeIntervalMs: 1000,
            totalTriggerCount: 3, onFinished: () => {
                /* When all triggers finished, obj.val should be equal to 3
                because the timer triggers three times.
                */
                expect(obj.val).to.equal(3);

            }
        })
    });

    it('should trigger the timers in specified trigger count.', () => {
        const exampleCallback = sinon.stub();

        limitedTriggeredTimer.runLimitedTriggeredTimer(exampleCallback, {
            timeIntervalMs: 1000,
            totalTriggerCount: 3,
        })

        setTimeout(() => {
            // The exampleCallback should be called three times totally.

            expect(exampleCallback.callCount).equal(3);
        }, 6000)




    })
    it('should trigger the timers in specified trigger count manually via next function.', () => {
        const exampleCallback = sinon.stub();

        limitedTriggeredTimer.runLimitedTriggeredTimerManually((next) => {
            exampleCallback()
            // Run the next trigger after specific time interval
            next()

        }, {
            timeIntervalMs: 1000,
            totalTriggerCount: 3,
        })

        setTimeout(() => {
            // The exampleCallback should be called three times totally.
            expect(exampleCallback.callCount).equal(3);
        }, 6000)


    })


    it('should clear the timers early manually any time', () => {
        const exampleCallback = sinon.stub();

        let clearTimer = limitedTriggeredTimer.runLimitedTriggeredTimer(() => {
            exampleCallback()
        }, {
            timeIntervalMs: 1000,
            totalTriggerCount: 4,
        })

        setTimeout(() => {
            // The timer cleared in manually after three seconds
            clearTimer()
        }, 3000)

        setTimeout(()=>{
            expect(exampleCallback.callCount).lessThan(5);
        
        },6000)

    })

});
