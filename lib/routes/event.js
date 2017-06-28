'use strict';

const eventDiffer = require('../event-differ');
const version = 1;

module.exports = function(app, config) {
    const { eventStore } = config.stores;

    app.get('/events', (req, res) => {
        eventStore.getEvents().then(events => {
            eventDiffer.addDiffs(events);
            res.json({ version, events });
        });
    });

    app.get('/events/:name', (req, res) => {
        const toggleName = req.params.name;
        eventStore.getEventsFilterByName(toggleName).then(events => {
            if (events) {
                eventDiffer.addDiffs(events);
                res.json({
                    toggleName,
                    events,
                });
            } else {
                res.status(404).json({ error: 'Could not find events' });
            }
        });
    });
};
