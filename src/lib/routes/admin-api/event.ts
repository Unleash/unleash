import type { Request, Response } from 'express';
import type { IUnleashConfig } from '../../types/option';
import type { IUnleashServices } from '../../types/services';
import type EventService from '../../features/events/event-service';
import { ADMIN, NONE } from '../../types/permissions';
import type { IEvent, IEventList } from '../../types/events';
import Controller from '../controller';
import { anonymiseKeys } from '../../util/anonymise';
import type { OpenApiService } from '../../services/openapi-service';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import {
    eventsSchema,
    type EventsSchema,
} from '../../../lib/openapi/spec/events-schema';
import { serializeDates } from '../../../lib/types/serialize-dates';
import {
    featureEventsSchema,
    type FeatureEventsSchema,
} from '../../../lib/openapi/spec/feature-events-schema';
import { getStandardResponses } from '../../../lib/openapi/util/standard-responses';
import { createRequestSchema } from '../../openapi/util/create-request-schema';
import type { DeprecatedSearchEventsSchema } from '../../openapi/spec/deprecated-search-events-schema';
import type { IFlagResolver } from '../../types/experimental';
import type { IAuthRequest } from '../unleash-types';
import {
    eventCreatorsSchema,
    type ProjectFlagCreatorsSchema,
} from '../../openapi';

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
            path: '/events',
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
            path: '/events/:featureName',
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
                        'Returns all events related to the specified feature flag. If the feature flag does not exist, the list of events will be empty.',
                    summary:
                        'Get all events related to a specific feature flag.',
                }),
            ],
        });

        this.route({
            method: 'post',
            path: '/events/search',
            handler: this.deprecatedSearchEvents,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    operationId: 'deprecatedSearchEvents',
                    tags: ['Events'],
                    deprecated: true,
                    summary: 'Search for events (deprecated)',
                    description:
                        'Allows searching for events matching the search criteria in the request body',
                    requestBody: createRequestSchema(
                        'deprecatedSearchEventsSchema',
                    ),
                    responses: { 200: createResponseSchema('eventsSchema') },
                }),
            ],
        });

        this.route({
            method: 'get',
            path: '/event-creators',
            handler: this.getEventCreators,
            permission: NONE,
            middleware: [
                this.openApiService.validPath({
                    tags: ['Events'],
                    operationId: 'getEventCreators',
                    summary: 'Get a list of all users that have created events',
                    description:
                        'Returns a list of all users that have created events in the system.',
                    responses: {
                        200: createResponseSchema('eventCreatorsSchema'),
                        ...getStandardResponses(401, 403, 404),
                    },
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
            eventList = await this.eventService.deprecatedSearchEvents({
                project,
            });
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
        const eventList = await this.eventService.deprecatedSearchEvents({
            feature,
        });

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

    async deprecatedSearchEvents(
        req: Request<unknown, unknown, DeprecatedSearchEventsSchema>,
        res: Response<EventsSchema>,
    ): Promise<void> {
        const eventList = await this.eventService.deprecatedSearchEvents(
            req.body,
        );

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

    async getEventCreators(
        req: IAuthRequest,
        res: Response<ProjectFlagCreatorsSchema>,
    ): Promise<void> {
        const flagCreators = await this.eventService.getEventCreators();

        this.openApiService.respondWithValidation(
            200,
            res,
            eventCreatorsSchema.$id,
            serializeDates(flagCreators),
        );
    }
}
