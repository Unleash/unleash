'use strict';

const { Router } = require('express');

const eventDiffer = require('../../event-differ');
const version = 1;

module.exports.router = function(config) {
    const { eventStore } = config.stores;
    const router = Router();

    router.get('/', (req, res) => {
        eventStore.getEvents().then(events => {
            eventDiffer.addDiffs(events);
            res.json({ version, events });
        });
    });

    router.get('/:name', (req, res) => {
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

    return router;
};
