var reqwest = require('reqwest');

var TYPE         = 'json';
var CONTENT_TYPE = 'application/json';

var EventStore = {
    getEvents: function () {
        return reqwest({
            url: 'events',
            method: 'get',
            type: TYPE
        });
    },

    getEventsByName: function (name) {
        return reqwest({
            url: 'events/' + name,
            method: 'get',
            type: TYPE
        });
    }

};

module.exports = EventStore;
