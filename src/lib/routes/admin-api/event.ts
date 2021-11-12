import { Request, Response } from 'express';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import EventService from '../../services/event-service';
import { ADMIN } from '../../types/permissions';
import { IEvent } from '../../types/events';
import Controller from '../controller';

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

    async getEvents(
        req: Request<any, any, any, { project?: string }>,
        res: Response,
    ): Promise<void> {
        const { project } = req.query;
        let events: IEvent[];
        if (project) {
            events = await this.eventService.getEventsForProject(project);
        } else {
            events = await this.eventService.getEvents();
        }
        res.json({ version, events });
    }

    async getEventsForToggle(
        req: Request<{ name: string }>,
        res: Response,
    ): Promise<void> {
        const toggleName = req.params.name;
        const events = await this.eventService.getEventsForToggle(toggleName);

        if (events) {
            res.json({ toggleName, events });
        } else {
            res.status(404).json({ error: 'Could not find events' });
        }
    }
}
