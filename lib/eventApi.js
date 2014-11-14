var eventDb = require('./eventDb');

module.exports = function (app) {

    app.get('/events', function (req, res) {
        eventDb.getEvents().then(function (events) {
            res.json({events: events});
        });
    });

    app.get('/events/:name', function (req, res) {
        eventDb.getEventsFilterByName(req.params.name).then(function (events) {
            if (events) {
                res.json(events);
            } else {
                res.status(404).json({error: 'Could not find events'});
            }
        });
    });


};