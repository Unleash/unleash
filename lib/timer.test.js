'use strict';

const test = require('ava');
const timer = require('./timer');

function timeout(fn, ms) {
    return new Promise(resolve =>
        setTimeout(() => {
            fn();
            resolve();
        }, ms)
    );
}

test('should calculate the correct time in milliseconds', t => {
    t.is(timer.milliseconds([1, 0]), 1000);
    t.is(timer.milliseconds([0, 1e6]), 1);
    t.is(timer.milliseconds([1, 1e6]), 1001);
    t.is(timer.milliseconds([1, 552]), 1000.000552);
});

test('timer should track the time', async t => {
    const tt = timer.new();
    let diff;
    await timeout(() => {
        diff = tt();
    }, 20);
    if (diff > 19 && diff < 50) {
        return t.pass();
    }
    t.fail();
});
