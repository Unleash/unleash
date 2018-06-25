'use strict';

module.exports = () => {
    const events = [];

    return {
        store: event => {
            events.push(event);
            Promise.resolve();
        },
        getEvents: () => Promise.resolve(events),
    };
};
