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
import { RevisionDelta } from './revision-delta';
import type {
    FeatureConfigurationDeltaClient,
    IClientFeatureToggleDeltaReadModel,
} from './client-feature-toggle-delta-read-model-type';
import { CLIENT_DELTA_MEMORY } from '../../../metric-events';
import type EventEmitter from 'events';
import type { Logger } from '../../../logger';

type DeletedFeature = {
    name: string;
    project: string;
};

export type RevisionDeltaEntry = {
    updated: FeatureConfigurationDeltaClient[];
    revisionId: number;
    removed: DeletedFeature[];
    segments: IClientSegment[];
};

export type Revision = {
    revisionId: number;
    updated: any[];
    removed: DeletedFeature[];
};

type Revisions = Record<string, RevisionDelta>;

const applyRevision = (first: Revision, last: Revision): Revision => {
    const updatedMap = new Map(
        [...first.updated, ...last.updated].map((feature) => [
            feature.name,
            feature,
        ]),
    );
    const removedMap = new Map(
        [...first.removed, ...last.removed].map((feature) => [
            feature.name,
            feature,
        ]),
    );

    for (const feature of last.removed) {
        updatedMap.delete(feature.name);
    }

    for (const feature of last.updated) {
        removedMap.delete(feature.name);
    }

    return {
        revisionId: last.revisionId,
        updated: Array.from(updatedMap.values()),
        removed: Array.from(removedMap.values()),
    };
};

const filterRevisionByProject = (
    revision: Revision,
    projects: string[],
): Revision => {
    const updated = revision.updated.filter(
        (feature) =>
            projects.includes('*') || projects.includes(feature.project),
    );
    const removed = revision.removed
        .filter(
            (feature) =>
                projects.includes('*') || projects.includes(feature.project),
        )
        .map((feature) => feature.name);

    return { ...revision, updated, removed };
};

export const calculateRequiredClientRevision = (
    revisions: Revision[],
    requiredRevisionId: number,
    projects: string[],
) => {
    const targetedRevisions = revisions.filter(
        (revision) => revision.revisionId > requiredRevisionId,
    );
    const projectFeatureRevisions = targetedRevisions.map((revision) =>
        filterRevisionByProject(revision, projects),
    );

    return projectFeatureRevisions.reduce(applyRevision);
};

export class ClientFeatureToggleDelta {
    private clientFeatureToggleDeltaReadModel: IClientFeatureToggleDeltaReadModel;

    private delta: Revisions = {};

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
    ): Promise<RevisionDeltaEntry | undefined> {
        const projects = query.project ? query.project : ['*'];
        const environment = query.environment ? query.environment : 'default';
        // TODO: filter by tags, what is namePrefix? anything else?
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

        const environmentRevisions = this.delta[environment].getRevisions();

        const compressedRevision = calculateRequiredClientRevision(
            environmentRevisions,
            requiredRevisionId,
            projects,
        );

        const revisionResponse = {
            ...compressedRevision,
            segments: this.segments,
        };

        return Promise.resolve(revisionResponse);
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

        const changedToggles = [
            ...new Set(
                changeEvents
                    .filter((event) => event.featureName)
                    // .filter((event) => event.type !== 'feature-archived')
                    .map((event) => event.featureName!),
            ),
        ];

        const removed = changeEvents
            .filter((event) => event.featureName && event.project)
            .filter((event) => event.type === 'feature-archived')
            .map((event) => ({
                name: event.featureName!,
                project: event.project!,
            }));

        // TODO: we might want to only update the environments that had events changed for performance
        for (const environment of keys) {
            const newToggles = await this.getChangedToggles(
                environment,
                changedToggles,
            );
            this.delta[environment].addRevision({
                updated: newToggles,
                revisionId: latestRevision,
                removed,
            });
        }
        this.currentRevisionId = latestRevision;
    }

    async getChangedToggles(
        environment: string,
        toggles: string[],
    ): Promise<FeatureConfigurationDeltaClient[]> {
        const foundToggles = await this.getClientFeatures({
            toggleNames: toggles,
            environment,
        });
        return foundToggles;
    }

    public async initEnvironmentDelta(environment: string) {
        // Todo: replace with method that gets all features for an environment
        const baseFeatures = await this.getClientFeatures({
            environment,
        });

        this.currentRevisionId =
            await this.configurationRevisionService.getMaxRevisionId();

        const delta = new RevisionDelta([
            {
                revisionId: this.currentRevisionId,
                updated: baseFeatures,
                removed: [],
            },
        ]);
        this.delta[environment] = delta;

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
