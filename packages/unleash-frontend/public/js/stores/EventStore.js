'use strict';
const reqwest = require('reqwest');

const TYPE         = 'json';

const EventStore = {
    getEvents() {
        return reqwest({
            url: 'events',
            method: 'get',
            type: TYPE
        });
    },

    getEventsByName(name) {
        return reqwest({
            url: `events/${name}`,
            method: 'get',
            type: TYPE
        });
    }

};

module.exports = EventStore;
