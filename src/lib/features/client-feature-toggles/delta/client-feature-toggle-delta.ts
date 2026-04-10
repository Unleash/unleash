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
import {
    FEATURE_ARCHIVED,
    FEATURE_DELETED,
    FEATURE_PROJECT_CHANGE,
    SEGMENT_CREATED,
    SEGMENT_DELETED,
    SEGMENT_UPDATED,
    type IEvent,
} from '../../../events/index.js';
import { getVisibleRevision } from './visible-revision.js';
import { createGauge } from '../../../util/metrics/index.js';
import { BadDataError } from '../../../server-impl.js';

export type EnvironmentRevisions = Record<string, DeltaCache>;
export type EnvironmentVisibleRevisionState = {
    projectRevisions: Map<string, number>;
    globalSegmentRevision: number;
};

export const UPDATE_DELTA = 'UPDATE_DELTA';

export const filterEventsByQuery = (
    events: DeltaEvent[],
    requestedRevisionId: number,
    projects: string[],
    namePrefix: string,
) => {
    const targetedEvents = events.filter(
        (revision) => revision.eventId > requestedRevisionId,
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

const deltaRevisionIdMetric = createGauge({
    name: 'delta_environment_revision_id',
    help: 'Current delta revision id for environment',
    labelNames: ['environment'],
});

const setMaxRevision = <K>(map: Map<K, number>, key: K, revisionId: number) => {
    const currentRevisionId = map.get(key) ?? 0;
    if (revisionId > currentRevisionId) {
        map.set(key, revisionId);
    }
};

export class ClientFeatureToggleDelta extends EventEmitter {
    private static instance: ClientFeatureToggleDelta;

    private clientFeatureToggleDeltaReadModel: IClientFeatureToggleDeltaReadModel;

    private delta: EnvironmentRevisions = {};

    private visibleRevisions: Record<string, EnvironmentVisibleRevisionState> =
        {};

    private eventStore: IEventStore;

    private lastDeltaProcessedRevisionId: number = 0;

    private flagResolver: IFlagResolver;

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
        this.clientFeatureToggleDeltaReadModel =
            clientFeatureToggleDeltaReadModel;
        this.flagResolver = flagResolver;
        this.segmentReadModel = segmentReadModel;
        this.eventBus = config.eventBus;
        this.logger = config.getLogger('delta/client-feature-toggle-delta.js');
        this.onUpdateRevisionEvent = this.onUpdateRevisionEvent.bind(this);
        this.delta = {};

        // just subscribe to revision update events that are scheduled every second
        configurationRevisionService.on(
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
        const projects =
            query.project && query.project.length > 0 ? query.project : ['*'];
        const environment = query.environment ? query.environment : 'default';
        const namePrefix = query.namePrefix ? query.namePrefix : '';
        const hasRequestedRevision = sdkRevisionId !== undefined;
        const requestedRevisionId = sdkRevisionId ?? 0;

        if (this.delta[environment] === undefined) {
            await this.initEnvironmentDelta(environment);
        }

        const visibleRevision = this.getVisibleRevision(environment, projects);

        if (hasRequestedRevision && requestedRevisionId >= visibleRevision) {
            this.logger.info(
                `[delta] No new delta for environment=${environment} projects=${projects.join(',')} visibleRevision=${visibleRevision} requestedRevision=${requestedRevisionId}`,
            );
            return undefined;
        }
        const delta = this.delta[environment];
        if (
            !hasRequestedRevision ||
            delta.isMissingRevision(requestedRevisionId)
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
            this.logger.info(
                `[revision] Fresh delta hydration for environment=${environment} projects=${projects.join(',')} visibleRevision=${visibleRevision} hydrationEventId=${hydrationEvent.eventId} returnedHydrationEventId=${filteredEvent.eventId}`,
            );

            const response: ClientFeaturesDeltaSchema = {
                events: [filteredEvent],
            };

            return Promise.resolve(response);
        } else {
            const environmentEvents = delta.getEvents();
            const events = filterEventsByQuery(
                environmentEvents,
                requestedRevisionId,
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
            try {
                await this.updateFeaturesDelta();
                this.storeFootprint();
                this.emit(UPDATE_DELTA);
            } catch (e) {
                if (e instanceof BadDataError) {
                    this.logger.warn(
                        'Error updating client feature, reinitializing hydration event',
                        e,
                    );
                    for (const environment of Object.keys(this.delta)) {
                        await this.initEnvironmentDelta(environment);
                    }
                } else {
                    this.logger.error(
                        'Unexpected error updating client feature delta',
                        e,
                    );
                }
            }
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
        const featuresRemoved: {
            revisionId: number;
            featureName: string;
            project: string;
        }[] = [];
        const segmentsUpdated = new Map<number, number>(); // segmentId -> max revisionId
        const segmentsRemoved = new Map<number, number>(); // segmentId -> max revisionId
        const globallyUpdatedFeatures = new Map<string, number>(); // featureName -> max revisionId
        const environmentUpdatedFeatures = new Map<
            string,
            Map<string, number>
        >();

        for (const event of changeEvents) {
            if (event.type === FEATURE_PROJECT_CHANGE && event.featureName) {
                // A project change involves two steps: removing the feature from old project and adding it to new project
                featuresRemoved.push({
                    featureName: event.featureName,
                    project: event.data.oldProject,
                    revisionId: event.id,
                });
                setMaxRevision(
                    globallyUpdatedFeatures,
                    event.featureName,
                    event.id,
                );
            } else if (
                event.type === FEATURE_ARCHIVED &&
                event.featureName &&
                event.project
            ) {
                featuresRemoved.push({
                    featureName: event.featureName,
                    project: event.project,
                    revisionId: event.id,
                });
            } else if (
                event.type === SEGMENT_CREATED ||
                event.type === SEGMENT_UPDATED
            ) {
                const segmentId = event.data?.id;
                if (!segmentId) {
                    throw new BadDataError(
                        `[delta] Skipping event ${event.id} ${event.createdAt.toISOString()} (${event.type}) because data is missing id.`,
                    );
                }
                setMaxRevision(segmentsUpdated, segmentId, event.id);
            } else if (event.type === SEGMENT_DELETED) {
                // we were previously using data.id for segment-deleted event, this was changed on Sep 29, 2023: https://github.com/Unleash/unleash/pull/4815
                const segmentId = event.preData?.id;
                if (!segmentId) {
                    throw new BadDataError(
                        `[delta] Skipping event ${event.id} ${event.createdAt.toISOString()} (${event.type}) because preData is missing id.`,
                    );
                }
                setMaxRevision(segmentsRemoved, segmentId, event.id);
            } else if (event.featureName && event.type !== FEATURE_DELETED) {
                if (event.environment == null) {
                    setMaxRevision(
                        globallyUpdatedFeatures,
                        event.featureName,
                        event.id,
                    );
                } else {
                    const featureNames =
                        environmentUpdatedFeatures.get(event.environment) ??
                        new Map<string, number>();
                    setMaxRevision(featureNames, event.featureName, event.id);
                    environmentUpdatedFeatures.set(
                        event.environment,
                        featureNames,
                    );
                }
            } else {
                // This is something we need to adjust for. If the event wasn't really needed we should not include it in the events to process
                this.logger.error(
                    `[delta] Skipping event ${event.type} ${event.id}. It was cosidered interesting but wasn't processed: ${JSON.stringify({ data: event.data, preData: event.preData })}.`,
                );
            }
        }

        return {
            featuresRemoved,
            segmentsUpdated,
            segmentsRemoved,
            globallyUpdatedFeatures,
            environmentUpdatedFeatures,
        };
    }

    // executes on every change, with max lag of 1 second
    private async updateFeaturesDelta() {
        const environments = Object.keys(this.delta);

        if (environments.length === 0) return;

        const eventsFrom = this.lastDeltaProcessedRevisionId;
        const eventsTo = await this.eventStore.getMaxRevisionId(eventsFrom);

        if (eventsTo <= eventsFrom) {
            return; // no new events, no need to process
        }
        this.logger.info(
            `[revision] Delta max revision advanced: ${eventsFrom} -> ${eventsTo}`,
        );

        const changeEvents = await this.eventStore.getRevisionRange(
            eventsFrom,
            eventsTo,
        );

        const {
            featuresRemoved,
            segmentsUpdated,
            segmentsRemoved,
            globallyUpdatedFeatures,
            environmentUpdatedFeatures,
        } = this.processChangeEvents(changeEvents);

        const updatedSegments = await this.segmentReadModel.getAllForClientIds(
            Array.from(segmentsUpdated.keys()),
        );

        const featuresRemovedEvents: DeltaEvent[] = featuresRemoved.map(
            ({ revisionId, featureName, project }) => ({
                eventId: revisionId,
                type: DELTA_EVENT_TYPES.FEATURE_REMOVED,
                featureName,
                project,
            }),
        );

        const segmentsUpdatedEvents: DeltaEvent[] = updatedSegments.map(
            (segment) => ({
                eventId: segmentsUpdated.get(segment.id) ?? eventsTo,
                type: DELTA_EVENT_TYPES.SEGMENT_UPDATED,
                segment,
            }),
        );

        const segmentsRemovedEvents: DeltaEvent[] = Array.from(
            segmentsRemoved.entries(),
        ).map(([segmentId, revisionId]) => ({
            eventId: revisionId,
            type: DELTA_EVENT_TYPES.SEGMENT_REMOVED,
            segmentId,
        }));

        for (const environment of environments) {
            // merge globally updated features with environment specific updates, keep the max revision id for each feature
            const featureUpdatesInEnvironment = new Map<string, number>(
                globallyUpdatedFeatures,
            );
            for (const [
                featureName,
                revisionId,
            ] of environmentUpdatedFeatures.get(environment) ?? []) {
                setMaxRevision(
                    featureUpdatesInEnvironment,
                    featureName,
                    revisionId,
                );
            }
            const updatedToggles = await this.getChangedToggles(
                environment,
                Array.from(featureUpdatesInEnvironment.keys()),
            );
            const featuresUpdatedEvents: DeltaEvent[] = updatedToggles.map(
                (toggle) => ({
                    eventId:
                        featureUpdatesInEnvironment.get(toggle.name) ??
                        eventsTo,
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
                [...featuresRemovedEvents, ...featuresUpdatedEvents],
                [...segmentsUpdatedEvents, ...segmentsRemovedEvents],
            );
        }
        this.lastDeltaProcessedRevisionId = eventsTo;
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
        const revisionState =
            await this.eventStore.getDeltaRevisionState(environment);
        const baseFeatures = await this.getClientFeatures({
            environment,
        });
        const baseSegments = await this.segmentReadModel.getAllForClientIds();

        const maxRevision = getVisibleRevision(revisionState);
        this.delta[environment] = new DeltaCache({
            eventId: maxRevision,
            type: DELTA_EVENT_TYPES.HYDRATION,
            features: baseFeatures,
            segments: baseSegments,
        });
        this.lastDeltaProcessedRevisionId = maxRevision;
        this.visibleRevisions[environment] = revisionState;
        this.storeFootprint();
    }

    private getVisibleRevision(
        environment: string,
        projects: string[],
    ): number {
        const revisionState = this.visibleRevisions[environment];
        return getVisibleRevision(revisionState, projects);
    }

    private updateVisibleRevisions(
        environment: string,
        featureEvents: DeltaEvent[],
        segmentEvents: DeltaEvent[],
    ) {
        const revisionState = this.visibleRevisions[environment] ?? {
            projectRevisions: new Map<string, number>(),
            globalSegmentRevision: 0,
        };

        if (segmentEvents.length > 0) {
            for (const event of segmentEvents) {
                revisionState.globalSegmentRevision = Math.max(
                    revisionState.globalSegmentRevision,
                    event.eventId,
                );
            }
        }

        // assume segment revision id as max feature event
        let environmentMax = revisionState.globalSegmentRevision;
        for (const event of featureEvents) {
            let project: string | undefined;
            if (event.type === DELTA_EVENT_TYPES.FEATURE_UPDATED) {
                project = event.feature.project!;
            } else if (event.type === DELTA_EVENT_TYPES.FEATURE_REMOVED) {
                project = event.project;
            }
            if (project) {
                setMaxRevision(
                    revisionState.projectRevisions,
                    project,
                    event.eventId,
                );
                environmentMax = Math.max(environmentMax, event.eventId);
            }
        }

        deltaRevisionIdMetric.labels({ environment }).set(environmentMax);
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
