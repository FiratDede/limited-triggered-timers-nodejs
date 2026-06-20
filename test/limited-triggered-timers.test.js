const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const sinon = require('sinon');

const limitedTriggeredTimer = require('../dist');

describe('Limited Triggered Timers package', () => {
    let clock;

    beforeEach(() => {
        clock = sinon.useFakeTimers();
    });

    afterEach(() => {
        clock.restore();
    });

    it('should use default options when options are not provided.', () => {
        const exampleCallback = sinon.stub();

        limitedTriggeredTimer.runLimitedTriggeredTimer(exampleCallback);

        clock.tick(999);
        assert.equal(exampleCallback.callCount, 0);

        clock.tick(1);
        assert.equal(exampleCallback.callCount, 1);

        clock.tick(5000);
        assert.equal(exampleCallback.callCount, 1);
    });

    it('should trigger the timer in the specified trigger count.', () => {
        const exampleCallback = sinon.stub();
        const onFinished = sinon.stub();

        limitedTriggeredTimer.runLimitedTriggeredTimer(exampleCallback, {
            timeIntervalMs: 1000,
            totalTriggerCount: 3,
            onFinished,
        });

        clock.tick(2999);
        assert.equal(exampleCallback.callCount, 2);
        assert.equal(onFinished.callCount, 0);

        clock.tick(1);
        assert.equal(exampleCallback.callCount, 3);
        assert.equal(onFinished.callCount, 1);

        clock.tick(5000);
        assert.equal(exampleCallback.callCount, 3);
        assert.equal(onFinished.callCount, 1);
    });

    it('should trigger the manual timer in the specified trigger count via next function.', () => {
        const exampleCallback = sinon.stub();
        const onFinished = sinon.stub();

        limitedTriggeredTimer.runLimitedTriggeredTimerManually((next) => {
            exampleCallback();
            next();
        }, {
            timeIntervalMs: 1000,
            totalTriggerCount: 3,
            onFinished,
        });

        clock.tick(3000);

        assert.equal(exampleCallback.callCount, 3);
        assert.equal(onFinished.callCount, 1);
    });

    it('should ignore duplicate next calls for the same manual trigger.', () => {
        const exampleCallback = sinon.stub();
        const onFinished = sinon.stub();

        limitedTriggeredTimer.runLimitedTriggeredTimerManually((next) => {
            exampleCallback();
            next();
            next();
        }, {
            timeIntervalMs: 1000,
            totalTriggerCount: 3,
            onFinished,
        });

        clock.tick(3000);
        clock.tick(5000);

        assert.equal(exampleCallback.callCount, 3);
        assert.equal(onFinished.callCount, 1);
    });

    it('should clear the interval timer early.', () => {
        const exampleCallback = sinon.stub();
        const clearTimer = limitedTriggeredTimer.runLimitedTriggeredTimer(exampleCallback, {
            timeIntervalMs: 1000,
            totalTriggerCount: 4,
        });

        clock.tick(2500);
        clearTimer();
        clock.tick(5000);

        assert.equal(exampleCallback.callCount, 2);
    });

    it('should clear the manual timer early.', () => {
        const exampleCallback = sinon.stub();
        const clearTimer = limitedTriggeredTimer.runLimitedTriggeredTimerManually((next) => {
            exampleCallback();
            next();
        }, {
            timeIntervalMs: 1000,
            totalTriggerCount: 4,
        });

        clock.tick(1000);
        clearTimer();
        clock.tick(5000);

        assert.equal(exampleCallback.callCount, 1);
    });

    it('should use default options for manual timers when options are not provided.', () => {
        const exampleCallback = sinon.stub();

        limitedTriggeredTimer.runLimitedTriggeredTimerManually((next) => {
            exampleCallback();
            next();
        });

        clock.tick(1000);
        clock.tick(5000);

        assert.equal(exampleCallback.callCount, 1);
    });
});
