'use strict';

const test = require('ava');
const timer = require('./timer');

function timeout(fn, ms) {
    return new Promise(resolve =>
        setTimeout(() => {
            fn();
            resolve();
        }, ms),
    );
}

test('should calculate the correct time in seconds', t => {
    t.is(timer.seconds([1, 0]), 1);
    t.is(timer.seconds([0, 1e6]), 0.001);
    t.is(timer.seconds([1, 1e6]), 1.001);
    t.is(timer.seconds([1, 552]), 1.000000552);
});

test('timer should track the time', async t => {
    const tt = timer.new();
    let diff;
    await timeout(() => {
        diff = tt();
    }, 20);
    if (diff > 0.019 && diff < 0.05) {
        return t.pass();
    }
    return t.fail();
});
