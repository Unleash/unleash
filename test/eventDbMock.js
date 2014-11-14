var Promise = require("bluebird");

var events = [
    {
        "id": 1,
        "created_at": 1414159948677,
        "type": "feature-create",
        "created_by": "me",
        "data": {

        }
    },
    {
        "id": 2,
        "created_at": 1414159948677,
        "type": "feature-create",
        "created_by": "me",
        "data": {
            "foo": "bar"
        }
    },
    {
        "id": 3,
        "created_at": 1414159948677,
        "type": "feature-create",
        "created_by": "me",
        "data": {
            "foo": "rab",
            "name": "myname"
        }
    }
];

var filterableEvents = [
    {
        "id": 1,
        "created_at": 1414159948677,
        "type": "feature-create",
        "created_by": "me",
        "data": {
            "name": "foo"
        }
    },
    {
        "id": 2,
        "created_at": 1414159948677,
        "type": "feature-create",
        "created_by": "me",
        "data": {
            "name": "bar"
        }
    },
    {
        "id": 3,
        "created_at": 1414159948677,
        "type": "feature-create",
        "created_by": "me",
        "data": {
            "name": "myname"
        }
    }
];


function filterEventsByName(name) {
    return filterableEvents.filter(function (n){return n.data.name===name;});
}

function getEvent(name) {
    var eventFound;
    events.forEach(function (event) {
        if (event.name === name) {
            eventFound = event;
        }
    });

    return eventFound;
}

function storeEvent() {
    return new Promise(function (resolve) {
        resolve();
    });
}


module.exports = {
    store: storeEvent,

    getEvents: function() {
        return new Promise(function (resolve) {
            resolve(events);
        });
    },

    getEventsFilterByName: function(name) {
        return new Promise(function (resolve) {
            resolve(filterEventsByName(name));
        });
    },

    getEvent: function(name) {
        var event = getEvent(name);
        if(event) {
            return Promise.resolve(event);
        } else {
            return Promise.reject("Event not found");
        }
    }

};