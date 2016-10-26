'use strict';

const reqwest = require('reqwest');

const TYPE         = 'json';

const EventStore = {
    getEvents () {
        return reqwest({
            url: 'events',
            method: 'get',
            type: TYPE,
        });
    },

    getEventsByName (eventName) {
        return reqwest({
            url: `events/${eventName}`,
            method: 'get',
            type: TYPE,
        });
    },

};

module.exports = EventStore;
