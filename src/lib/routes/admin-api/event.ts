import { Request, Response } from 'express';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import EventService from '../../services/event-service';
import { ADMIN, NONE } from '../../types/permissions';
import { IEvent } from '../../types/events';
import Controller from '../controller';
import { anonymise } from '../../util/anonymise';
import { OpenApiService } from '../../services/openapi-service';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import { endpointDescriptions } from '../../openapi/endpoint-descriptions';
import {
    eventsSchema,
    EventsSchema,
} from '../../../lib/openapi/spec/events-schema';
import { serializeDates } from '../../../lib/types/serialize-dates';
import {
    featureEventsSchema,
    FeatureEventsSchema,
} from '../../../lib/openapi/spec/feature-events-schema';
import { getStandardResponses } from '../../../lib/openapi/util/standard-responses';

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
                    tags: ['Events'],
                    responses: {
                        ...getStandardResponses(401),
                        200: createResponseSchema('eventsSchema'),
                    },

                    parameters: [
                        {
                            name: 'project',
                            description:
                                'The name of the project whose events you want to retrieve',
                            schema: { type: 'string' },
                            in: 'query',
                        },
                    ],

                    ...endpointDescriptions.admin.events,
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/:featureName',
            handler: this.getEventsForToggle,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    operationId: 'getEventsForToggle',
                    tags: ['Events'],
                    responses: {
                        ...getStandardResponses(401),
                        200: createResponseSchema('featureEventsSchema'),
                    },
                    ...endpointDescriptions.admin.eventsPerFeature,
                }),
            ],
        });
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
        req: Request<{ featureName: string }>,
        res: Response<FeatureEventsSchema>,
    ): Promise<void> {
        const toggleName = req.params.featureName;
        const events = await this.eventService.getEventsForToggle(toggleName);

        const response = {
            version,
            toggleName,
            events: serializeDates(this.fixEvents(events)),
        };

        this.openApiService.respondWithValidation(
            200,
            res,
            featureEventsSchema.$id,
            response,
        );
    }
}
