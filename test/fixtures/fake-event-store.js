'use strict';

module.exports = () => {
    const events = [];

    return {
        store: event => {
            events.push(event);
            return Promise.resolve();
        },
        getEvents: () => Promise.resolve(events),
    };
};
