import type {
    IClientSegment,
    IEventStore,
    IFeatureToggleDeltaQuery,
    IFeatureToggleQuery,
    IFlagResolver,
    ISegmentReadModel,
    IUnleashConfig,
} from '../../../types';
import type ConfigurationRevisionService from '../../feature-toggle/configuration-revision-service';
import { UPDATE_REVISION } from '../../feature-toggle/configuration-revision-service';
import { DeltaCache } from './delta-cache';
import type {
    FeatureConfigurationDeltaClient,
    IClientFeatureToggleDeltaReadModel,
} from './client-feature-toggle-delta-read-model-type';
import { CLIENT_DELTA_MEMORY } from '../../../metric-events';
import type EventEmitter from 'events';
import type { Logger } from '../../../logger';
import type { ClientFeaturesDeltaSchema } from '../../../openapi';
import {
    DELTA_EVENT_TYPES,
    type DeltaEvent,
    type DeltaHydrationEvent,
    isDeltaFeatureRemovedEvent,
    isDeltaFeatureUpdatedEvent,
} from './client-feature-toggle-delta-types';

type EnvironmentRevisions = Record<string, DeltaCache>;

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
            startsWithPrefix(revision) && (allProjects || isInProject(revision))
        );
    });
};

export const filterHydrationEventByQuery = (
    event: DeltaHydrationEvent,
    projects: string[],
    namePrefix: string,
): DeltaHydrationEvent => {
    const allProjects = projects.includes('*');
    const { type, features, eventId } = event;

    return {
        eventId,
        type,
        features: features.filter((feature) => {
            return (
                feature.name.startsWith(namePrefix) &&
                (allProjects || projects.includes(feature.project!))
            );
        }),
    };
};

export class ClientFeatureToggleDelta {
    private clientFeatureToggleDeltaReadModel: IClientFeatureToggleDeltaReadModel;

    private delta: EnvironmentRevisions = {};

    private segments: IClientSegment[];

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

        this.initRevisionId();
        this.updateSegments();
        this.configurationRevisionService.on(
            UPDATE_REVISION,
            this.onUpdateRevisionEvent,
        );
    }

    private async initRevisionId() {
        this.currentRevisionId =
            await this.configurationRevisionService.getMaxRevisionId();
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
        const hasSegments = this.segments;
        if (!hasSegments) {
            await this.updateSegments();
        }
        if (requiredRevisionId >= this.currentRevisionId) {
            return undefined;
        }
        if (requiredRevisionId === 0) {
            const hydrationEvent = this.delta[environment].getHydrationEvent();
            const filteredEvent = filterHydrationEventByQuery(
                hydrationEvent,
                projects,
                namePrefix,
            );

            const response: ClientFeaturesDeltaSchema = {
                events: [
                    {
                        ...filteredEvent,
                        segments: this.segments,
                    },
                ],
            };

            return Promise.resolve(response);
        } else {
            const environmentEvents = this.delta[environment].getEvents();
            const events = filterEventsByQuery(
                environmentEvents,
                requiredRevisionId,
                projects,
                namePrefix,
            );

            const response: ClientFeaturesDeltaSchema = {
                events: events.map((event) => {
                    if (event.type === 'feature-removed') {
                        const { project, ...rest } = event;
                        return rest;
                    }
                    return event;
                }),
            };

            return Promise.resolve(response);
        }
    }

    public async onUpdateRevisionEvent() {
        if (this.flagResolver.isEnabled('deltaApi')) {
            await this.updateFeaturesDelta();
            await this.updateSegments();
            this.storeFootprint();
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

        // TODO: implement single segment fetching
        // const segmentsUpdated = changeEvents
        //     .filter((event) => event.type === 'segment-updated')
        //     .map((event) => ({
        //         name: event.featureName!,
        //         project: event.project!,
        //     }));
        //
        // const segmentsRemoved = changeEvents
        //     .filter((event) => event.type === 'segment-deleted')
        //     .map((event) => ({
        //         name: event.featureName!,
        //         project: event.project!,
        //     }));
        //

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
                ...featuresUpdatedEvents,
                ...featuresRemovedEvents,
            ]);
        }
        this.currentRevisionId = latestRevision;
    }

    async getChangedToggles(
        environment: string,
        toggles: string[],
    ): Promise<FeatureConfigurationDeltaClient[]> {
        return this.getClientFeatures({
            toggleNames: toggles,
            environment,
        });
    }

    public async initEnvironmentDelta(environment: string) {
        // Todo: replace with method that gets all features for an environment
        const baseFeatures = await this.getClientFeatures({
            environment,
        });

        this.currentRevisionId =
            await this.configurationRevisionService.getMaxRevisionId();

        this.delta[environment] = new DeltaCache({
            eventId: this.currentRevisionId,
            type: DELTA_EVENT_TYPES.HYDRATION,
            features: baseFeatures,
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

    private async updateSegments(): Promise<void> {
        this.segments = await this.segmentReadModel.getActiveForClient();
    }

    storeFootprint() {
        try {
            const featuresMemory = this.getCacheSizeInBytes(this.delta);
            const segmentsMemory = this.getCacheSizeInBytes(this.segments);
            const memory = featuresMemory + segmentsMemory;
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
