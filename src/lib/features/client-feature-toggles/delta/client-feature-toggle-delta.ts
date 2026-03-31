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
import { FEATURE_PROJECT_CHANGE, type IEvent } from '../../../events/index.js';
import { getVisibleRevisionForProjects } from './visible-revision.js';

type EnvironmentRevisions = Record<string, DeltaCache>;
type EnvironmentVisibleRevisionState = {
    projectRevisions: Map<string, number>;
    globalSegmentRevision: number;
};

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

    private visibleRevisions: Record<string, EnvironmentVisibleRevisionState> =
        {};

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
        const hasRequestedRevision = sdkRevisionId !== undefined;
        const requiredRevisionId = sdkRevisionId ?? 0;

        const hasDelta = this.delta[environment] !== undefined;

        if (!hasDelta) {
            await this.initEnvironmentDelta(environment);
        }

        const visibleRevision = this.getVisibleRevision(environment, projects);

        if (hasRequestedRevision && requiredRevisionId >= visibleRevision) {
            return undefined;
        }
        const delta = this.delta[environment];
        if (
            !hasRequestedRevision ||
            delta.isMissingRevision(requiredRevisionId)
        ) {
            const hydrationEvent = delta.getHydrationEvent();
            const filteredEvent = filterHydrationEventByQuery(
                hydrationEvent,
                projects,
                namePrefix,
            );
            const effectiveEventId =
                visibleRevision === 0
                    ? hydrationEvent.eventId
                    : visibleRevision;

            filteredEvent.eventId = effectiveEventId;

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
        this.visibleRevisions = {};
    }

    private processChangeEvents(changeEvents: IEvent[]) {
        const featuresRemoved: { featureName: string; project: string }[] = [];
        const segmentsUpdatedIds: number[] = [];
        const segmentsRemovedIds: number[] = [];
        const globallyUpdatedFeatures = new Set<string>();
        const environmentUpdatedFeatures = new Map<string, Set<string>>();

        for (const event of changeEvents) {
            if (event.type === FEATURE_PROJECT_CHANGE && event.featureName) {
                // A project change involves two steps: removing the feature from old project and adding it to new project
                featuresRemoved.push({
                    featureName: event.featureName,
                    project: event.data.oldProject,
                });
                globallyUpdatedFeatures.add(event.featureName);
            } else if (
                event.type === 'feature-archived' &&
                event.featureName &&
                event.project
            ) {
                featuresRemoved.push({
                    featureName: event.featureName,
                    project: event.project,
                });
            } else if (
                event.type === 'segment-created' ||
                event.type === 'segment-updated'
            ) {
                segmentsUpdatedIds.push(event.data.id);
            } else if (event.type === 'segment-deleted') {
                segmentsRemovedIds.push(event.preData.id);
            } else if (event.featureName && event.type !== 'feature-deleted') {
                if (event.environment == null) {
                    globallyUpdatedFeatures.add(event.featureName);
                } else {
                    const featureNames =
                        environmentUpdatedFeatures.get(event.environment) ??
                        new Set<string>();
                    featureNames.add(event.featureName);
                    environmentUpdatedFeatures.set(
                        event.environment,
                        featureNames,
                    );
                }
            }
        }

        return {
            featuresRemoved,
            segmentsUpdatedIds,
            segmentsRemovedIds,
            globallyUpdatedFeatures,
            environmentUpdatedFeatures,
        };
    }

    private async updateFeaturesDelta() {
        const environments = Object.keys(this.delta);

        if (environments.length === 0) return;
        const latestRevision =
            await this.configurationRevisionService.getMaxRevisionId();

        const changeEvents = await this.eventStore.getRevisionRange(
            this.currentRevisionId,
            latestRevision,
        );

        const {
            featuresRemoved,
            segmentsUpdatedIds,
            segmentsRemovedIds,
            globallyUpdatedFeatures,
            environmentUpdatedFeatures,
        } = this.processChangeEvents(changeEvents);

        const updatedSegments =
            await this.segmentReadModel.getAllForClientIds(segmentsUpdatedIds);

        const featuresRemovedEvents: DeltaEvent[] = featuresRemoved.map(
            ({ featureName, project }) => ({
                eventId: latestRevision,
                type: DELTA_EVENT_TYPES.FEATURE_REMOVED,
                featureName,
                project,
            }),
        );

        const segmentsUpdatedEvents: DeltaEvent[] = updatedSegments.map(
            (segment) => ({
                eventId: latestRevision,
                type: DELTA_EVENT_TYPES.SEGMENT_UPDATED,
                segment,
            }),
        );

        const segmentsRemovedEvents: DeltaEvent[] = segmentsRemovedIds.map(
            (segmentId) => ({
                eventId: latestRevision,
                type: DELTA_EVENT_TYPES.SEGMENT_REMOVED,
                segmentId,
            }),
        );

        const hasSegmentChanges =
            segmentsUpdatedEvents.length > 0 ||
            segmentsRemovedEvents.length > 0;

        for (const environment of environments) {
            const featureUpdatesInEnvironment = [
                ...globallyUpdatedFeatures,
                ...(environmentUpdatedFeatures.get(environment) ?? []),
            ];
            const newToggles = await this.getChangedToggles(
                environment,
                featureUpdatesInEnvironment,
            );
            const featuresUpdatedEvents: DeltaEvent[] = newToggles.map(
                (toggle) => ({
                    eventId: latestRevision,
                    type: DELTA_EVENT_TYPES.FEATURE_UPDATED,
                    feature: toggle,
                }),
            );
            this.delta[environment].addEvents([
                ...featuresRemovedEvents,
                ...featuresUpdatedEvents,
                ...segmentsUpdatedEvents,
                ...segmentsRemovedEvents,
            ]);
            this.updateVisibleRevisions(
                environment,
                latestRevision,
                [...featuresRemovedEvents, ...featuresUpdatedEvents],
                hasSegmentChanges,
            );
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
        const revisionState = await this.eventStore.getDeltaRevisionState(
            environment,
            this.currentRevisionId,
        );

        this.delta[environment] = new DeltaCache({
            eventId: this.currentRevisionId,
            type: DELTA_EVENT_TYPES.HYDRATION,
            features: baseFeatures,
            segments: baseSegments,
        });
        this.visibleRevisions[environment] = revisionState;

        this.storeFootprint();
    }

    private getVisibleRevision(
        environment: string,
        projects: string[],
    ): number {
        const delta = this.delta[environment];
        const revisionState = this.visibleRevisions[environment];
        return getVisibleRevisionForProjects(
            revisionState,
            projects,
            delta.getHydrationEvent().eventId,
        );
    }

    private updateVisibleRevisions(
        environment: string,
        revisionId: number,
        featureEvents: DeltaEvent[],
        hasSegmentChanges: boolean,
    ) {
        const revisionState = this.visibleRevisions[environment] ?? {
            projectRevisions: new Map<string, number>(),
            globalSegmentRevision: 0,
        };

        if (hasSegmentChanges) {
            revisionState.globalSegmentRevision = revisionId;
        }

        for (const event of featureEvents) {
            if (event.type === DELTA_EVENT_TYPES.FEATURE_UPDATED) {
                revisionState.projectRevisions.set(
                    event.feature.project!,
                    revisionId,
                );
            }

            if (event.type === DELTA_EVENT_TYPES.FEATURE_REMOVED) {
                revisionState.projectRevisions.set(event.project, revisionId);
            }
        }

        this.visibleRevisions[environment] = revisionState;
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
