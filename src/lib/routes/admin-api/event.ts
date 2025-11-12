import type { Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { IUnleashConfig } from '../../types/option.js';
import type { IUnleashServices } from '../../services/index.js';
import type EventService from '../../features/events/event-service.js';
import { ADMIN, NONE } from '../../types/permissions.js';
import type { IEvent, IEventList } from '../../events/index.js';
import Controller from '../controller.js';
import { anonymiseKeys } from '../../util/anonymise.js';
import type { OpenApiService } from '../../services/openapi-service.js';
import { createResponseSchema } from '../../openapi/util/create-response-schema.js';
import {
    eventsSchema,
    type EventsSchema,
} from '../../../lib/openapi/spec/events-schema.js';
import { serializeDates } from '../../../lib/types/serialize-dates.js';
import {
    featureEventsSchema,
    type FeatureEventsSchema,
} from '../../../lib/openapi/spec/feature-events-schema.js';
import { getStandardResponses } from '../../../lib/openapi/util/standard-responses.js';
import type { IFlagResolver } from '../../types/experimental.js';
import type { IAuthRequest } from '../unleash-types.js';
import {
    eventCreatorsSchema,
    type ProjectFlagCreatorsSchema,
} from '../../openapi/index.js';
import { extractUserIdFromUser } from '../../util/index.js';

const ANON_KEYS = ['email', 'username', 'createdBy'];
const version = 1 as const;

type FeatureNameParam = ParamsDictionary & {
    featureName: string;
};
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
                    deprecated: true,
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
                    deprecated: true,
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
        req: IAuthRequest<any, any, any, { project?: string }>,
        res: Response<EventsSchema>,
    ): Promise<void> {
        const { user, query } = req;
        const { project } = query;
        let eventList: IEventList;
        if (project) {
            eventList = await this.eventService.searchEvents(
                {
                    project: `IS:${project}`,
                    offset: 0,
                    limit: 50,
                },
                extractUserIdFromUser(user),
            );
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
        req: IAuthRequest<FeatureNameParam>,
        res: Response<FeatureEventsSchema>,
    ): Promise<void> {
        const { user, params } = req;
        const { featureName } = params;
        const eventList = await this.eventService.searchEvents(
            {
                feature: `IS:${featureName}`,
                offset: 0,
                limit: 50,
            },
            extractUserIdFromUser(user),
        );

        const response = {
            version,
            toggleName: featureName,
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
