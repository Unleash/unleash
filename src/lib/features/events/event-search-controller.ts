import type { Response } from 'express';
import type { IUnleashConfig } from '../../types/option.js';
import type { IUnleashServices } from '../../services/index.js';
import type EventService from '../../features/events/event-service.js';
import { NONE } from '../../types/permissions.js';
import type { OpenApiService } from '../../services/openapi-service.js';
import { createResponseSchema } from '../../openapi/util/create-response-schema.js';
import { serializeDates } from '../../../lib/types/serialize-dates.js';
import type { IFlagResolver } from '../../types/experimental.js';
import {
    type EventSearchQueryParameters,
    eventSearchQueryParameters,
} from '../../openapi/spec/event-search-query-parameters.js';
import {
    type EventSearchResponseSchema,
    eventSearchResponseSchema,
} from '../../openapi/index.js';
import { normalizeQueryParams } from '../feature-search/search-utils.js';
import Controller from '../../routes/controller.js';
import type { IEnrichedEvent, IEvent } from '../../events/index.js';
import { anonymiseKeys, extractUserIdFromUser } from '../../util/index.js';
import {
    FeatureEventFormatterMd,
    type FeatureEventFormatter,
} from '../../addons/feature-event-formatter-md.js';
import type { IAuthRequest } from '../../routes/unleash-types.js';

const ANON_KEYS = ['email', 'username', 'createdBy'];
const _version = 1 as const;
export default class EventSearchController extends Controller {
    private eventService: EventService;

    private flagResolver: IFlagResolver;

    private msgFormatter: FeatureEventFormatter;

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
        this.msgFormatter = new FeatureEventFormatterMd({
            unleashUrl: config.server.unleashUrl,
            formatStyle: 'markdown',
        });

        this.route({
            method: 'get',
            path: '',
            handler: this.searchEvents,
            permission: NONE,
            middleware: [
                openApiService.validPath({
                    operationId: 'searchEvents',
                    tags: ['Events'],
                    summary: 'Search for events',
                    description:
                        'Allows searching for events that match the query parameter criteria.',
                    parameters: [...eventSearchQueryParameters],
                    responses: {
                        200: createResponseSchema('eventSearchResponseSchema'),
                    },
                }),
            ],
        });
    }

    async searchEvents(
        req: IAuthRequest<any, any, any, EventSearchQueryParameters>,
        res: Response<EventSearchResponseSchema>,
    ): Promise<void> {
        const { user } = req;
        const { normalizedLimit, normalizedOffset } = normalizeQueryParams(
            req.query,
            {
                limitDefault: 50,
                maxLimit: 1000,
            },
        );

        const { events, totalEvents } = await this.eventService.searchEvents(
            {
                ...req.query,
                offset: normalizedOffset,
                limit: normalizedLimit,
            },
            extractUserIdFromUser(user),
        );

        const enrichedEvents = this.enrichEvents(events);

        this.openApiService.respondWithValidation(
            200,
            res,
            eventSearchResponseSchema.$id,
            serializeDates({
                events: serializeDates(
                    this.maybeAnonymiseEvents(enrichedEvents),
                ),
                total: totalEvents,
            }),
        );
    }

    enrichEvents(events: IEvent[]): IEvent[] | IEnrichedEvent[] {
        return events.map((event) => {
            const { label, text: summary } = this.msgFormatter.format(event);

            return {
                ...event,
                label,
                summary,
            };
        });
    }

    maybeAnonymiseEvents(events: IEvent[]): IEvent[] {
        if (this.flagResolver.isEnabled('anonymiseEventLog')) {
            return anonymiseKeys(events, ANON_KEYS);
        }
        return events;
    }
}
