var eventDb = require('./eventDb');

module.exports = function (app) {

    app.get('/events', function (req, res) {
        eventDb.getEvents().then(function (events) {
            res.json({events: events});
        });
    });
};