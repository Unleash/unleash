'use strict';

import { handleErrors } from './util';

const Controller = require('../controller');

const eventDiffer = require('../../event-differ');

const version = 1;

class EventController extends Controller {
    constructor(config) {
        super(config);
        this.eventStore = config.stores.eventStore;
        this.get('/', this.getEvents);
        this.get('/:name', this.getEventsForToggle);
    }

    async getEvents(req, res) {
        try {
            const events = await this.eventStore.getEvents();
            eventDiffer.addDiffs(events);
            res.json({ version, events });
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }

    async getEventsForToggle(req, res) {
        const toggleName = req.params.name;
        try {
            const events = await this.eventStore.getEventsFilterByName(
                toggleName,
            );

            if (events) {
                eventDiffer.addDiffs(events);
                res.json({ toggleName, events });
            } else {
                res.status(404).json({ error: 'Could not find events' });
            }
        } catch (e) {
            handleErrors(res, this.logger, e);
        }
    }
}

module.exports = EventController;
