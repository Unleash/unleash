/* eslint-disable no-param-reassign */
import timer from './timer';

// wrapTimer keeps track of the timing of a async operation and emits
// a event on the given eventBus once the operation is complete
//
// the returned function is designed to be used as a .then(<func>) argument.
// It transparently passes the data to the following .then(<func>)
//
// usage: promise.then(wrapTimer(bus, type, { payload: 'ok' }))
const wrapTimer: (EventEmitter, string, object) => (any) => any = (
    eventBus,
    event,
    args = {},
) => {
    const t = timer.new();
    return (data) => {
        args.time = t();
        eventBus.emit(event, args);
        return data;
    };
};

const metricsHelper = {
    wrapTimer,
};
export default metricsHelper;
module.exports = {
    wrapTimer,
};
