import { Request, Response } from 'express';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import EventService from '../../services/event-service';
import { ADMIN } from '../../types/permissions';
import { IEvent } from '../../types/events';
import Controller from '../controller';
import { anonymise } from '../../util/anonymise';
import { OpenApiService } from '../../services/openapi-service';
import { createResponseSchema } from '../../../lib/openapi';
import {
    eventsSchema,
    EventsSchema,
} from '../../../lib/openapi/spec/events-schema';
import { serializeDates } from '../../../lib/types/serialize-dates';

const version = 1;
export default class EventController extends Controller {
    private eventService: EventService;

    private anonymise: boolean = false;

    private openApiService: OpenApiService;

    constructor(
        config: IUnleashConfig,
        {
            eventService,
            openApiService,
        }: Pick<IUnleashServices, 'eventService' | 'openApiService'>,
    ) {
        super(config);
        this.eventService = eventService;
        this.anonymise = config.experimental?.anonymiseEventLog;
        this.openApiService = openApiService;

        this.route({
            method: 'get',
            path: '',
            handler: this.getEvents,
            permission: ADMIN,
            middleware: [
                openApiService.validPath({
                    operationId: 'getEvents',
                    tags: ['admin'],
                    responses: {
                        200: createResponseSchema('eventsSchema'),
                    },
                }),
            ],
        });

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
        res: Response<EventsSchema>,
    ): Promise<void> {
        const { project } = req.query;
        let events: IEvent[];
        if (project) {
            events = await this.eventService.getEventsForProject(project);
        } else {
            events = await this.eventService.getEvents();
        }

        const response: EventsSchema = {
            version,
            events: serializeDates(this.fixEvents(events)),
        };
        this.openApiService.respondWithValidation(
            200,
            res,
            eventsSchema.$id,
            response,
        );
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
