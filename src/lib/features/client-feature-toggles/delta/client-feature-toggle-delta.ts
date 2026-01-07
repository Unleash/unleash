import type {
    IEventStore,
    IFeatureToggleDeltaQuery,
    IFeatureToggleQuery,
    IFlagResolver,
    ISegmentReadModel,
    IUnleashConfig,
} from '../../../types/index.js';
import type ConfigurationRevisionService from '../../feature-toggle/configuration-revision-service.js';
import { UPDATE_REVISION } from '../../feature-toggle/configuration-revision-service.js';
import { DeltaCache } from './delta-cache.js';
import type {
    FeatureConfigurationDeltaClient,
    IClientFeatureToggleDeltaReadModel,
} from './client-feature-toggle-delta-read-model-type.js';
import { CLIENT_DELTA_MEMORY } from '../../../metric-events.js';
import EventEmitter from 'events';
import type { Logger } from '../../../logger.js';
import type { ClientFeaturesDeltaSchema } from '../../../openapi/index.js';
import {
    DELTA_EVENT_TYPES,
    type DeltaEvent,
    type DeltaHydrationEvent,
    isDeltaFeatureRemovedEvent,
    isDeltaFeatureUpdatedEvent,
    isDeltaSegmentEvent,
} from './client-feature-toggle-delta-types.js';
import { FEATURE_PROJECT_CHANGE } from '../../../events/index.js';

type EnvironmentRevisions = Record<string, DeltaCache>;

export const UPDATE_DELTA = 'UPDATE_DELTA';

export const filterEventsByQuery = (
    events: DeltaEvent[],
    requiredRevisionId: number,
    projects: string[],
    namePrefix: string,
) => {
    const targetedEvents = events.filter(
        (revision) => revision.eventId > requiredRevisionId,
    );
    const allProjects = projects.includes('*');
    const startsWithPrefix = (revision: DeltaEvent) => {
        return (
            (isDeltaFeatureUpdatedEvent(revision) &&
                revision.feature.name.startsWith(namePrefix)) ||
            (isDeltaFeatureRemovedEvent(revision) &&
                revision.featureName.startsWith(namePrefix))
        );
    };

    const isInProject = (revision: DeltaEvent) => {
        return (
            (isDeltaFeatureUpdatedEvent(revision) &&
                projects.includes(revision.feature.project!)) ||
            (isDeltaFeatureRemovedEvent(revision) &&
                projects.includes(revision.project))
        );
    };

    return targetedEvents.filter((revision) => {
        return (
            isDeltaSegmentEvent(revision) ||
            (startsWithPrefix(revision) &&
                (allProjects || isInProject(revision)))
        );
    });
};

export const filterHydrationEventByQuery = (
    event: DeltaHydrationEvent,
    projects: string[],
    namePrefix: string,
): DeltaHydrationEvent => {
    const allProjects = projects.includes('*');
    const { type, features, eventId, segments } = event;

    return {
        eventId,
        type,
        segments,
        features: features.filter((feature) => {
            return (
                feature.name.startsWith(namePrefix) &&
                (allProjects || projects.includes(feature.project!))
            );
        }),
    };
};

export class ClientFeatureToggleDelta extends EventEmitter {
    private static instance: ClientFeatureToggleDelta;

    private clientFeatureToggleDeltaReadModel: IClientFeatureToggleDeltaReadModel;

    private delta: EnvironmentRevisions = {};

    private eventStore: IEventStore;

    private currentRevisionId: number = 0;

    private flagResolver: IFlagResolver;

    private configurationRevisionService: ConfigurationRevisionService;

    private readonly segmentReadModel: ISegmentReadModel;

    private eventBus: EventEmitter;

    private readonly logger: Logger;

    constructor(
        clientFeatureToggleDeltaReadModel: IClientFeatureToggleDeltaReadModel,
        segmentReadModel: ISegmentReadModel,
        eventStore: IEventStore,
        configurationRevisionService: ConfigurationRevisionService,
        flagResolver: IFlagResolver,
        config: IUnleashConfig,
    ) {
        super();
        this.eventStore = eventStore;
        this.configurationRevisionService = configurationRevisionService;
        this.clientFeatureToggleDeltaReadModel =
            clientFeatureToggleDeltaReadModel;
        this.flagResolver = flagResolver;
        this.segmentReadModel = segmentReadModel;
        this.eventBus = config.eventBus;
        this.logger = config.getLogger('delta/client-feature-toggle-delta.js');
        this.onUpdateRevisionEvent = this.onUpdateRevisionEvent.bind(this);
        this.delta = {};

        this.configurationRevisionService.on(
            UPDATE_REVISION,
            this.onUpdateRevisionEvent,
        );
    }

    static getInstance(
        clientFeatureToggleDeltaReadModel: IClientFeatureToggleDeltaReadModel,
        segmentReadModel: ISegmentReadModel,
        eventStore: IEventStore,
        configurationRevisionService: ConfigurationRevisionService,
        flagResolver: IFlagResolver,
        config: IUnleashConfig,
    ) {
        if (!ClientFeatureToggleDelta.instance) {
            ClientFeatureToggleDelta.instance = new ClientFeatureToggleDelta(
                clientFeatureToggleDeltaReadModel,
                segmentReadModel,
                eventStore,
                configurationRevisionService,
                flagResolver,
                config,
            );
        }
        return ClientFeatureToggleDelta.instance;
    }

    async getDelta(
        sdkRevisionId: number | undefined,
        query: IFeatureToggleQuery,
    ): Promise<ClientFeaturesDeltaSchema | undefined> {
        const projects = query.project ? query.project : ['*'];
        const environment = query.environment ? query.environment : 'default';
        const namePrefix = query.namePrefix ? query.namePrefix : '';

        const requiredRevisionId = sdkRevisionId || 0;

        const hasDelta = this.delta[environment] !== undefined;

        if (!hasDelta) {
            await this.initEnvironmentDelta(environment);
        }

        if (requiredRevisionId >= this.currentRevisionId) {
            return undefined;
        }
        const delta = this.delta[environment];
        if (
            requiredRevisionId === 0 ||
            delta.isMissingRevision(requiredRevisionId)
        ) {
            const hydrationEvent = delta.getHydrationEvent();
            const filteredEvent = filterHydrationEventByQuery(
                hydrationEvent,
                projects,
                namePrefix,
            );

            const response: ClientFeaturesDeltaSchema = {
                events: [filteredEvent],
            };

            return Promise.resolve(response);
        } else {
            const environmentEvents = delta.getEvents();
            const events = filterEventsByQuery(
                environmentEvents,
                requiredRevisionId,
                projects,
                namePrefix,
            );

            if (events.length === 0) {
                return undefined;
            }

            return {
                events,
            };
        }
    }

    public async onUpdateRevisionEvent() {
        if (this.flagResolver.isEnabled('deltaApi')) {
            await this.updateFeaturesDelta();
            this.storeFootprint();
            this.emit(UPDATE_DELTA);
        }
    }

    /**
     * This is used in client-feature-delta-api.e2e.test.ts, do not remove
     */
    public resetDelta() {
        this.delta = {};
    }

    private async updateFeaturesDelta() {
        const keys = Object.keys(this.delta);

        if (keys.length === 0) return;
        const latestRevision =
            await this.configurationRevisionService.getMaxRevisionId();

        const changeEvents = await this.eventStore.getRevisionRange(
            this.currentRevisionId,
            latestRevision,
        );

        const featuresMovedEvents = changeEvents
            .filter((event) => event.featureName)
            .filter((event) => event.type === FEATURE_PROJECT_CHANGE)
            .map((event) => ({
                eventId: latestRevision,
                type: DELTA_EVENT_TYPES.FEATURE_REMOVED,
                featureName: event.featureName!,
                project: event.data.oldProject,
            }));

        const featuresUpdated = [
            ...new Set(
                changeEvents
                    .filter((event) => event.featureName)
                    .filter((event) => event.type !== 'feature-archived')
                    .filter((event) => event.type !== 'feature-deleted')
                    .map((event) => event.featureName!),
            ),
        ];

        const featuresRemovedEvents: DeltaEvent[] = changeEvents
            .filter((event) => event.featureName && event.project)
            .filter((event) => event.type === 'feature-archived')
            .map((event) => ({
                eventId: latestRevision,
                type: DELTA_EVENT_TYPES.FEATURE_REMOVED,
                featureName: event.featureName!,
                project: event.project!,
            }));

        const segmentsUpdated = changeEvents
            .filter((event) =>
                ['segment-created', 'segment-updated'].includes(event.type),
            )
            .map((event) => event.data.id);

        const segmentsRemoved = changeEvents
            .filter((event) => event.type === 'segment-deleted')
            .map((event) => event.preData.id);

        const segments =
            await this.segmentReadModel.getAllForClientIds(segmentsUpdated);

        const segmentsUpdatedEvents: DeltaEvent[] = segments.map((segment) => ({
            eventId: latestRevision,
            type: DELTA_EVENT_TYPES.SEGMENT_UPDATED,
            segment,
        }));

        const segmentsRemovedEvents: DeltaEvent[] = segmentsRemoved.map(
            (segmentId) => ({
                eventId: latestRevision,
                type: DELTA_EVENT_TYPES.SEGMENT_REMOVED,
                segmentId,
            }),
        );

        // TODO: we might want to only update the environments that had events changed for performance
        for (const environment of keys) {
            const newToggles = await this.getChangedToggles(
                environment,
                featuresUpdated,
            );
            const featuresUpdatedEvents: DeltaEvent[] = newToggles.map(
                (toggle) => ({
                    eventId: latestRevision,
                    type: DELTA_EVENT_TYPES.FEATURE_UPDATED,
                    feature: toggle,
                }),
            );
            this.delta[environment].addEvents([
                ...featuresMovedEvents,
                ...featuresUpdatedEvents,
                ...featuresRemovedEvents,
                ...segmentsUpdatedEvents,
                ...segmentsRemovedEvents,
            ]);
        }
        this.currentRevisionId = latestRevision;
    }

    async getChangedToggles(
        environment: string,
        toggles: string[],
    ): Promise<FeatureConfigurationDeltaClient[]> {
        if (toggles.length === 0) {
            return [];
        }
        return this.getClientFeatures({
            toggleNames: toggles,
            environment,
        });
    }

    private async initEnvironmentDelta(environment: string) {
        const baseFeatures = await this.getClientFeatures({
            environment,
        });
        const baseSegments = await this.segmentReadModel.getAllForClientIds();

        this.currentRevisionId =
            await this.configurationRevisionService.getMaxRevisionId();

        this.delta[environment] = new DeltaCache({
            eventId: this.currentRevisionId,
            type: DELTA_EVENT_TYPES.HYDRATION,
            features: baseFeatures,
            segments: baseSegments,
        });

        this.storeFootprint();
    }

    async getClientFeatures(
        query: IFeatureToggleDeltaQuery,
    ): Promise<FeatureConfigurationDeltaClient[]> {
        const result =
            await this.clientFeatureToggleDeltaReadModel.getAll(query);
        return result;
    }

    storeFootprint() {
        try {
            const memory = this.getCacheSizeInBytes(this.delta);
            this.eventBus.emit(CLIENT_DELTA_MEMORY, { memory });
        } catch (e) {
            this.logger.error('Client delta footprint error', e);
        }
    }

    getCacheSizeInBytes(value: any): number {
        const jsonString = JSON.stringify(value);
        return Buffer.byteLength(jsonString, 'utf8');
    }
}

export type { DeltaEvent };
