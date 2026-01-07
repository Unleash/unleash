import type { IUnleashConfig } from '../../types/option.js';
import type { IFeatureTagStore, IUnleashStores } from '../../types/stores.js';
import type { Logger } from '../../logger.js';
import type {
    IEventSearchParams,
    IEventStore,
} from '../../types/stores/event-store.js';
import type { IApiUser, IUser } from '../../types/index.js';
import type EventEmitter from 'node:events';
import { ApiTokenType } from '../../types/model.js';
import { EVENTS_CREATED_BY_PROCESSED } from '../../metric-events.js';
import type { IQueryParam } from '../feature-toggle/types/feature-toggle-strategies-store-type.js';
import { parseSearchOperatorValue } from '../feature-search/search-utils.js';
import { addDays, formatISO } from 'date-fns';
import type { IPrivateProjectChecker } from '../private-project/privateProjectCheckerType.js';
import type { ProjectAccess } from '../private-project/privateProjectStore.js';
import type { IAccessReadModel } from '../access/access-read-model-type.js';
import lodash from 'lodash';
import type { IEventList, IBaseEvent } from '../../events/index.js';
import type { ITag } from '../../tags/index.js';
const { isEqual } = lodash;

export default class EventService {
    private logger: Logger;

    private eventStore: IEventStore;

    private featureTagStore: IFeatureTagStore;

    private accessReadModel: IAccessReadModel;

    private privateProjectChecker: IPrivateProjectChecker;

    private eventBus: EventEmitter;

    private isEnterprise: boolean;

    constructor(
        {
            eventStore,
            featureTagStore,
        }: Pick<IUnleashStores, 'eventStore' | 'featureTagStore'>,
        {
            getLogger,
            eventBus,
            isEnterprise,
        }: Pick<IUnleashConfig, 'getLogger' | 'eventBus' | 'isEnterprise'>,
        privateProjectChecker: IPrivateProjectChecker,
        accessReadModel: IAccessReadModel,
    ) {
        this.logger = getLogger('services/event-service.ts');
        this.eventStore = eventStore;
        this.privateProjectChecker = privateProjectChecker;
        this.featureTagStore = featureTagStore;
        this.eventBus = eventBus;
        this.isEnterprise = isEnterprise;
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
            queryParams,
            search.query,
        );
        const events = await this.eventStore.searchEvents(
            {
                limit: search.limit,
                offset: search.offset,
                query: search.query,
            },
            queryParams,
            {
                withIp: this.isEnterprise,
            },
        );
        return {
            events,
            totalEvents,
        };
    }

    onEvent(
        eventName: string | symbol,
        listener: (...args: any[]) => void,
    ): EventEmitter {
        return this.eventStore.on(eventName, listener);
    }

    off(
        eventName: string | symbol,
        listener: (...args: any[]) => void,
    ): EventEmitter {
        return this.eventStore.off(eventName, listener);
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
        // if the event comes with both preData and data, we need to check if they are different before storing, otherwise we discard the event
        let enhancedEvents = events.filter(
            (event) =>
                !event.preData ||
                !event.data ||
                !isEqual(event.preData, event.data),
        );
        if (enhancedEvents.length === 0) {
            return;
        }
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
            const parsed = parseSearchOperatorValue('created_at', params.to);
            if (parsed) {
                const values = parsed.values
                    .filter((v): v is string => v !== null)
                    .map((date) =>
                        formatISO(addDays(new Date(date), 1), {
                            representation: 'date',
                        }),
                    );
                queryParams.push({
                    field: parsed.field,
                    operator: 'IS_BEFORE',
                    values,
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

        if (params.groupId) {
            const parsed = parseSearchOperatorValue('group_id', params.groupId);
            if (parsed) queryParams.push(parsed);
        }

        ['project', 'type', 'environment', 'id'].forEach((field) => {
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
