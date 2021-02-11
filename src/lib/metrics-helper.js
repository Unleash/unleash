/* eslint-disable no-param-reassign */

'use strict';

const timer = require('./timer');

// wrapTimer keeps track of the timing of a async operation and emits
// a event on the given eventBus once the operation is complete
//
// the returned function is designed to be used as a .then(<func>) argument.
// It transparently passes the data to the following .then(<func>)
//
// usage: promise.then(wrapTimer(bus, type, { payload: 'ok' }))
const wrapTimer = (eventBus, event, args = {}) => {
    const t = timer.new();
    return data => {
        args.time = t();
        eventBus.emit(event, args);
        return data;
    };
};

module.exports = {
    wrapTimer,
};
