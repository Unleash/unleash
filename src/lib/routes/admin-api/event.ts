import { Request, Response } from 'express';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import EventService from '../../features/events/event-service';
import { ADMIN, NONE } from '../../types/permissions';
import { IEvent, IEventList } from '../../types/events';
import Controller from '../controller';
import { anonymiseKeys } from '../../util/anonymise';
import { OpenApiService } from '../../services/openapi-service';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
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
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import { SearchEventsSchema } from '../../openapi/spec/search-events-schema';
import { IFlagResolver } from '../../types/experimental';

const ANON_KEYS = ['email', 'username', 'createdBy'];
const version = 1 as const;
export default class EventController extends Controller {
    private eventService: EventService;

    private flagResolver: IFlagResolver;

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
        this.flagResolver = config.flagResolver;
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
                    description:
                        'Returns **the last 100** events from the Unleash instance when called without a query parameter. When called with a `project` parameter, returns **all events** for the specified project.\n\nIf the provided project does not exist, the list of events will be empty.',
                    summary:
                        'Get the most recent events from the Unleash instance or all events related to a project.',
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
                    description:
                        'Returns all events related to the specified feature toggle. If the feature toggle does not exist, the list of events will be empty.',
                    summary:
                        'Get all events related to a specific feature toggle.',
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/search',
            handler: this.searchEvents,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    operationId: 'searchEvents',
                    tags: ['Events'],
                    summary: 'Search for events',
                    description:
                        'Allows searching for events matching the search criteria in the request body',
                    requestBody: createRequestSchema('searchEventsSchema'),
                    responses: { 200: createResponseSchema('eventsSchema') },
                }),
            ],
        });
    }

    maybeAnonymiseEvents(events: IEvent[]): IEvent[] {
        if (this.flagResolver.isEnabled('anonymiseEventLog')) {
            return anonymiseKeys(events, ANON_KEYS);
        }
        return events;
    }

    async getEvents(
        req: Request<any, any, any, { project?: string }>,
        res: Response<EventsSchema>,
    ): Promise<void> {
        const { project } = req.query;
        let eventList: IEventList;
        if (project) {
            eventList = await this.eventService.searchEvents({ project });
        } else {
            eventList = await this.eventService.getEvents();
        }

        const response: EventsSchema = {
            version,
            events: serializeDates(this.maybeAnonymiseEvents(eventList.events)),
            totalEvents: eventList.totalEvents,
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
        const feature = req.params.featureName;
        const eventList = await this.eventService.searchEvents({ feature });

        const response = {
            version,
            toggleName: feature,
            events: serializeDates(this.maybeAnonymiseEvents(eventList.events)),
            totalEvents: eventList.totalEvents,
        };

        this.openApiService.respondWithValidation(
            200,
            res,
            featureEventsSchema.$id,
            response,
        );
    }

    async searchEvents(
        req: Request<unknown, unknown, SearchEventsSchema>,
        res: Response<EventsSchema>,
    ): Promise<void> {
        const eventList = await this.eventService.searchEvents(req.body);

        const response = {
            version,
            events: serializeDates(this.maybeAnonymiseEvents(eventList.events)),
            totalEvents: eventList.totalEvents,
        };

        this.openApiService.respondWithValidation(
            200,
            res,
            featureEventsSchema.$id,
            response,
        );
    }
}
