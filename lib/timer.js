'use strict';

const NS_TO_S = 1e9;

// seconds takes a tuple of [seconds, nanoseconds]
// and returns the time in seconds
const seconds = diff => diff[0] + diff[1] / NS_TO_S;

module.exports = {
    // new returns a timer function. Call it to measure the time since the call to new().
    // the timer function returns the duration in seconds
    //
    // usage:
    //
    // t = timer.new()
    // setTimeout(() => {
    //   diff = t()
    //   console.log(diff) // 0.500003192s
    // }, 500)
    //
    new: () => {
        const now = process.hrtime();
        // the timer function returns the time in seconds
        // since new() was called
        return () => seconds(process.hrtime(now));
    },
    seconds,
};
