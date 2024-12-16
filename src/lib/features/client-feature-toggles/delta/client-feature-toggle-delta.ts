import type {
    IEventStore,
    IFeatureToggleDeltaQuery,
    IFeatureToggleQuery,
    IFlagResolver,
    ISegmentReadModel,
} from '../../../types';
import type ConfigurationRevisionService from '../../feature-toggle/configuration-revision-service';
import { UPDATE_REVISION } from '../../feature-toggle/configuration-revision-service';
import { RevisionDelta } from './revision-delta';
import type {
    FeatureConfigurationDeltaClient,
    IClientFeatureToggleDeltaReadModel,
} from './client-feature-toggle-delta-read-model-type';
import type { Segment } from 'unleash-client/lib/strategy/strategy';
import { mapSegmentsForClient } from '../../playground/offline-unleash-client';

type DeletedFeature = {
    name: string;
    project: string;
};

export type RevisionDeltaEntry = {
    updated: FeatureConfigurationDeltaClient[];
    revisionId: number;
    removed: DeletedFeature[];
    segments: Segment[];
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
    const removed = revision.removed.filter(
        (feature) =>
            projects.includes('*') || projects.includes(feature.project),
    );
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
    console.log('targeted revisions', targetedRevisions);
    const projectFeatureRevisions = targetedRevisions.map((revision) =>
        filterRevisionByProject(revision, projects),
    );

    return projectFeatureRevisions.reduce(applyRevision);
};

export class ClientFeatureToggleDelta {
    private clientFeatureToggleDeltaReadModel: IClientFeatureToggleDeltaReadModel;

    private delta: Revisions = {};

    private segments: Segment[] = [];

    private eventStore: IEventStore;

    private currentRevisionId: number = 0;

    private interval: NodeJS.Timer;

    private flagResolver: IFlagResolver;

    private configurationRevisionService: ConfigurationRevisionService;

    private readonly segmentReadModel: ISegmentReadModel;

    constructor(
        clientFeatureToggleDeltaReadModel: IClientFeatureToggleDeltaReadModel,
        segmentReadModel: ISegmentReadModel,
        eventStore: IEventStore,
        configurationRevisionService: ConfigurationRevisionService,
        flagResolver: IFlagResolver,
    ) {
        this.eventStore = eventStore;
        this.configurationRevisionService = configurationRevisionService;
        this.clientFeatureToggleDeltaReadModel =
            clientFeatureToggleDeltaReadModel;
        this.flagResolver = flagResolver;
        this.segmentReadModel = segmentReadModel;
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

        // Should get the latest state if revision does not exist or if sdkRevision is not present
        // We should be able to do this without going to the database by merging revisions from the delta with
        // the base case
        const firstTimeCalling = !sdkRevisionId;
        if (
            firstTimeCalling ||
            (sdkRevisionId &&
                sdkRevisionId !== this.currentRevisionId &&
                !this.delta[environment].hasRevision(sdkRevisionId))
        ) {
            //TODO: populate delta based on this?
            return {
                revisionId: this.currentRevisionId,
                // @ts-ignore
                updated: await this.getClientFeatures({ environment }),
                segments: this.segments,
                removed: [],
            };
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

    private async onUpdateRevisionEvent() {
        if (this.flagResolver.isEnabled('deltaApi')) {
            await this.listenToRevisionChange();
            await this.updateSegments();
        }
    }

    public async listenToRevisionChange() {
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
                    .map((event) => event.featureName!),
            ),
        ];

        const removed = changeEvents
            .filter((event) => event.featureName && event.project)
            .filter((event) => event.type === 'feature-deleted')
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
    }

    async getClientFeatures(
        query: IFeatureToggleDeltaQuery,
    ): Promise<FeatureConfigurationDeltaClient[]> {
        const result =
            await this.clientFeatureToggleDeltaReadModel.getAll(query);
        return result;
    }

    private async updateSegments(): Promise<void> {
        this.segments = mapSegmentsForClient(
            await this.segmentReadModel.getAll(),
        );
    }
}
