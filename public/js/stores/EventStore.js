var reqwest = require('reqwest');

TYPE         = 'json';
CONTENT_TYPE = 'application/json';

var EventStore = {
    getEvents: function () {
        return reqwest({
            url: 'events',
            method: 'get',
            type: TYPE
        });
    }
};

module.exports = EventStore;
