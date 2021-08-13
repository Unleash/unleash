import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import EventService from '../../services/event-service';
import { ADMIN } from '../../types/permissions';

const Controller = require('../controller');

const eventDiffer = require('../../event-differ');

const version = 1;

export default class EventController extends Controller {
    private eventService: EventService;

    constructor(
        config: IUnleashConfig,
        { eventService }: Pick<IUnleashServices, 'eventService'>,
    ) {
        super(config);
        this.eventService = eventService;
        this.get('/', this.getEvents, ADMIN);
        this.get('/:name', this.getEventsForToggle);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async getEvents(req, res): Promise<void> {
        const events = await this.eventService.getEvents();
        eventDiffer.addDiffs(events);
        res.json({ version, events });
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    async getEventsForToggle(req, res): Promise<void> {
        const toggleName = req.params.name;
        const events = await this.eventService.getEventsForToggle(toggleName);

        if (events) {
            eventDiffer.addDiffs(events);
            res.json({ toggleName, events });
        } else {
            res.status(404).json({ error: 'Could not find events' });
        }
    }
}

module.exports = EventController;
