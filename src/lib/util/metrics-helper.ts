import type EventEmitter from 'events';
import timer from './timer';

// wrapTimer keeps track of the timing of a async operation and emits
// a event on the given eventBus once the operation is complete
//
// the returned function is designed to stop the timer and emit the event
//
// Usage:
// Define the timer function. It can  be done once per class.
// this.timer = (action: string) =>
//     metricsHelper.wrapTimer(eventBus, DB_TIME, {
//         store: 'client-feature-toggle-read-model',
//         action,
//     });
//
// Before performing an operation, start the timer:
// const stopTimer = this.timer(`timer-name`);
// // perform operation and then stop timer
// stopTimer();

const wrapTimer: (
    eventBus: EventEmitter,
    type: string,
    args: Record<string, unknown>,
) => (args: any) => any = (eventBus, event, args = {}) => {
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
