import type { Response } from 'express';
import type { IUnleashConfig } from '../../types/option';
import type { IUnleashServices } from '../../types/services';
import type EventService from '../../features/events/event-service';
import { NONE } from '../../types/permissions';
import type { OpenApiService } from '../../services/openapi-service';
import { createResponseSchema } from '../../openapi/util/create-response-schema';
import { serializeDates } from '../../../lib/types/serialize-dates';
import type { IFlagResolver } from '../../types/experimental';
import {
    type EventSearchQueryParameters,
    eventSearchQueryParameters,
} from '../../openapi/spec/event-search-query-parameters';
import {
    type EventSearchResponseSchema,
    eventSearchResponseSchema,
} from '../../openapi';
import { normalizeQueryParams } from '../../features/feature-search/search-utils';
import Controller from '../../routes/controller';
import type { IAuthRequest } from '../../server-impl';
import type { IEnrichedEvent, IEvent } from '../../types';
import { anonymiseKeys, extractUserIdFromUser } from '../../util';
import {
    FeatureEventFormatterMd,
    type FeatureEventFormatter,
} from '../../addons/feature-event-formatter-md';

const ANON_KEYS = ['email', 'username', 'createdBy'];
const version = 1 as const;
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
                        'Allows searching for events matching the search criteria in the request body. This operation is deprecated. You should perform a GET request to the same endpoint with your query encoded as query parameters instead.',
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
        if (this.flagResolver.isEnabled('eventTimeline')) {
            return events.map((event) => {
                const { label, text: summary } =
                    this.msgFormatter.format(event);

                return {
                    ...event,
                    label,
                    summary,
                };
            });
        }
        return events;
    }

    maybeAnonymiseEvents(events: IEvent[]): IEvent[] {
        if (this.flagResolver.isEnabled('anonymiseEventLog')) {
            return anonymiseKeys(events, ANON_KEYS);
        }
        return events;
    }
}
