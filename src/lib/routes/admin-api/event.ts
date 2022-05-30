import { Request, Response } from 'express';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import EventService from '../../services/event-service';
import { ADMIN } from '../../types/permissions';
import { IEvent } from '../../types/events';
import Controller from '../controller';
import { anonymise } from '../../util/anonymise';

const version = 1;
export default class EventController extends Controller {
    private eventService: EventService;

    private anonymise: boolean = false;

    constructor(
        config: IUnleashConfig,
        { eventService }: Pick<IUnleashServices, 'eventService'>,
    ) {
        super(config);
        this.eventService = eventService;
        this.anonymise = config.experimental?.anonymiseEventLog;
        this.get('/', this.getEvents, ADMIN);
        this.get('/:name', this.getEventsForToggle);
    }

    fixEvents(events: IEvent[]): IEvent[] {
        if (this.anonymise) {
            return events.map((e: IEvent) => ({
                ...e,
                createdBy: anonymise(e.createdBy),
            }));
        }
        return events;
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
        res.json({
            version,
            events: this.fixEvents(events),
        });
    }

    async getEventsForToggle(
        req: Request<{ name: string }>,
        res: Response,
    ): Promise<void> {
        const toggleName = req.params.name;
        const events = await this.eventService.getEventsForToggle(toggleName);

        res.json({
            version,
            toggleName,
            events: this.fixEvents(events),
        });
    }
}
