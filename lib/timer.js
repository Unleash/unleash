'use strict';

const NS_TO_MS = 1e6;

// milliseconds takes a tuple of [seconds, milliseconds]
// and returns the time in milliseconds
const milliseconds = diff => diff[0] * 1000 + diff[1] / NS_TO_MS;

module.exports = {
    // new returns a timer function. Call it to measure the time since the call to new().
    // the timer function returns the duration in milliseconds
    //
    // usage:
    //
    // t = timer.new()
    // setTimeout(() => {
    //   diff = t()
    //   console.log(diff) // 500.003192ms
    // }, 500)
    //
    new: () => {
        const now = process.hrtime();
        // the timer function returns the time in milliseconds
        // since new() was called
        return () => milliseconds(process.hrtime(now));
    },
    milliseconds,
};
