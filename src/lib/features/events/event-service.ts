import type { IUnleashConfig } from '../../types/option';
import type { IFeatureTagStore, IUnleashStores } from '../../types/stores';
import type { Logger } from '../../logger';
import type {
    IEventSearchParams,
    IEventStore,
} from '../../types/stores/event-store';
import type { IBaseEvent, IEventList } from '../../types/events';
import type { DeprecatedSearchEventsSchema } from '../../openapi/spec/deprecated-search-events-schema';
import type EventEmitter from 'events';
import type { IApiUser, ITag, IUser } from '../../types';
import { ApiTokenType } from '../../types/models/api-token';
import { EVENTS_CREATED_BY_PROCESSED } from '../../metric-events';
import type { IQueryParam } from '../feature-toggle/types/feature-toggle-strategies-store-type';
import { parseSearchOperatorValue } from '../feature-search/search-utils';
import { endOfDay, formatISO } from 'date-fns';
import type { IPrivateProjectChecker } from '../private-project/privateProjectCheckerType';
import type { ProjectAccess } from '../private-project/privateProjectStore';
import type { IAccessReadModel } from '../access/access-read-model-type';

export default class EventService {
    private logger: Logger;

    private eventStore: IEventStore;

    private featureTagStore: IFeatureTagStore;

    private accessReadModel: IAccessReadModel;

    private privateProjectChecker: IPrivateProjectChecker;

    private eventBus: EventEmitter;

    constructor(
        {
            eventStore,
            featureTagStore,
        }: Pick<IUnleashStores, 'eventStore' | 'featureTagStore'>,
        { getLogger, eventBus }: Pick<IUnleashConfig, 'getLogger' | 'eventBus'>,
        privateProjectChecker: IPrivateProjectChecker,
        accessReadModel: IAccessReadModel,
    ) {
        this.logger = getLogger('services/event-service.ts');
        this.eventStore = eventStore;
        this.privateProjectChecker = privateProjectChecker;
        this.featureTagStore = featureTagStore;
        this.eventBus = eventBus;
        this.accessReadModel = accessReadModel;
    }

    async getEvents(): Promise<IEventList> {
        const totalEvents = await this.eventStore.count();
        const events = await this.eventStore.getEvents();
        return {
            events,
            totalEvents,
        };
    }

    async deprecatedSearchEvents(
        search: DeprecatedSearchEventsSchema,
    ): Promise<IEventList> {
        const totalEvents =
            await this.eventStore.deprecatedFilteredCount(search);
        const events = await this.eventStore.deprecatedSearchEvents(search);
        return {
            events,
            totalEvents,
        };
    }

    async searchEvents(
        search: IEventSearchParams,
        userId: number,
    ): Promise<IEventList> {
        const projectAccess =
            await this.privateProjectChecker.getUserAccessibleProjects(userId);

        search.project = filterAccessibleProjects(
            search.project,
            projectAccess,
        );

        const queryParams = this.convertToDbParams(search);
        const projectFilter = await this.getProjectFilterForNonAdmins(userId);
        queryParams.push(...projectFilter);

        const totalEvents = await this.eventStore.searchEventsCount(
            {
                limit: search.limit,
                offset: search.offset,
                query: search.query,
            },
            queryParams,
        );
        const events = await this.eventStore.searchEvents(
            {
                limit: search.limit,
                offset: search.offset,
                query: search.query,
            },
            queryParams,
        );
        return {
            events,
            totalEvents,
        };
    }

    async onEvent(
        eventName: string | symbol,
        listener: (...args: any[]) => void,
    ): Promise<EventEmitter> {
        return this.eventStore.on(eventName, listener);
    }

    private async enhanceEventsWithTags(
        events: IBaseEvent[],
    ): Promise<IBaseEvent[]> {
        const featureNamesSet = new Set<string>();
        for (const event of events) {
            if (event.featureName && !event.tags) {
                featureNamesSet.add(event.featureName);
            }
        }

        const featureTagsMap: Map<string, ITag[]> = new Map();
        const allTagsInFeatures = await this.featureTagStore.getAllByFeatures(
            Array.from(featureNamesSet),
        );

        for (const tag of allTagsInFeatures) {
            const featureTags = featureTagsMap.get(tag.featureName) || [];
            featureTags.push({ value: tag.tagValue, type: tag.tagType });
            featureTagsMap.set(tag.featureName, featureTags);
        }

        for (const event of events) {
            if (event.featureName && !event.tags) {
                event.tags = featureTagsMap.get(event.featureName);
            }
        }

        return events;
    }

    isAdminToken(user: IUser | IApiUser): boolean {
        return (user as IApiUser)?.type === ApiTokenType.ADMIN;
    }

    async storeEvent(event: IBaseEvent): Promise<void> {
        return this.storeEvents([event]);
    }

    async storeEvents(events: IBaseEvent[]): Promise<void> {
        let enhancedEvents = events;
        for (const enhancer of [this.enhanceEventsWithTags.bind(this)]) {
            enhancedEvents = await enhancer(enhancedEvents);
        }
        return this.eventStore.batchStore(enhancedEvents);
    }

    async setEventCreatedByUserId(): Promise<void> {
        const updated = await this.eventStore.setCreatedByUserId(100);
        if (updated !== undefined) {
            this.eventBus.emit(EVENTS_CREATED_BY_PROCESSED, {
                updated,
            });
        }
    }

    convertToDbParams = (params: IEventSearchParams): IQueryParam[] => {
        const queryParams: IQueryParam[] = [];

        if (params.from) {
            const parsed = parseSearchOperatorValue('created_at', params.from);
            if (parsed) {
                queryParams.push({
                    field: parsed.field,
                    operator: 'IS_ON_OR_AFTER',
                    values: parsed.values,
                });
            }
        }

        if (params.to) {
            const parsed = parseSearchOperatorValue(
                'created_at',
                formatISO(endOfDay(new Date(params.to)), {
                    representation: 'date',
                }),
            );

            if (parsed) {
                queryParams.push({
                    field: parsed.field,
                    operator: 'IS_BEFORE',
                    values: parsed.values,
                });
            }
        }

        if (params.createdBy) {
            const parsed = parseSearchOperatorValue(
                'created_by_user_id',
                params.createdBy,
            );
            if (parsed) queryParams.push(parsed);
        }

        if (params.feature) {
            const parsed = parseSearchOperatorValue(
                'feature_name',
                params.feature,
            );
            if (parsed) queryParams.push(parsed);
        }

        ['project', 'type'].forEach((field) => {
            if (params[field]) {
                const parsed = parseSearchOperatorValue(field, params[field]);
                if (parsed) queryParams.push(parsed);
            }
        });

        return queryParams;
    };

    async getEventCreators() {
        return this.eventStore.getEventCreators();
    }

    async getProjectFilterForNonAdmins(userId: number): Promise<IQueryParam[]> {
        const isRootAdmin = await this.accessReadModel.isRootAdmin(userId);
        if (!isRootAdmin) {
            return [{ field: 'project', operator: 'IS_NOT', values: [null] }];
        }
        return [];
    }
}

export const filterAccessibleProjects = (
    projectParam: string | undefined,
    projectAccess: ProjectAccess,
): string | undefined => {
    if (projectAccess.mode !== 'all') {
        const allowedProjects = projectAccess.projects;

        if (!projectParam) {
            return `IS_ANY_OF:${allowedProjects.join(',')}`;
        } else {
            const searchProjectList = projectParam.split(',');
            const filteredProjects = searchProjectList
                .filter((proj) =>
                    allowedProjects.includes(
                        proj.replace(/^(IS|IS_ANY_OF):/, ''),
                    ),
                )
                .join(',');

            if (!filteredProjects) {
                throw new Error(
                    'No accessible projects in the search parameters',
                );
            }

            return filteredProjects;
        }
    }

    return projectParam;
};
