import type {
    IEventStore,
    IFeatureToggleCacheQuery,
    IFeatureToggleQuery,
    IFlagResolver,
} from '../../../types';
import type ConfigurationRevisionService from '../../feature-toggle/configuration-revision-service';
import { UPDATE_REVISION } from '../../feature-toggle/configuration-revision-service';
import { RevisionCache } from './revision-cache';
import type {
    FeatureConfigurationCacheClient,
    IClientFeatureToggleCacheReadModel,
} from './client-feature-toggle-cache-read-model-type';

export type RevisionCacheEntry = {
    updated: FeatureConfigurationCacheClient[];
    revisionId: number;
    removed: string[];
};

export type Revision = {
    revisionId: number;
    updated: any[];
    removed: string[];
};

type Revisions = Record<string, RevisionCache>;

const applyRevision = (first: Revision, last: Revision): Revision => {
    const updatedMap = new Map(
        [...first.updated, ...last.updated].map((feature) => [
            feature.name,
            feature,
        ]),
    );
    const removedMap = new Set([...first.removed, ...last.removed]);

    for (const feature of last.removed) {
        updatedMap.delete(feature);
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
        (feature) => projects.includes('*') || projects.includes(feature),
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

    return targetedRevisions.reduce(applyRevision);
};

export class ClientFeatureToggleCache {
    private clientFeatureToggleCacheReadModel: IClientFeatureToggleCacheReadModel;

    private cache: Revisions = {};

    private eventStore: IEventStore;

    private currentRevisionId: number = 0;

    private interval: NodeJS.Timer;

    private flagResolver: IFlagResolver;

    private configurationRevisionService: ConfigurationRevisionService;

    constructor(
        clientFeatureToggleCacheReadModel: IClientFeatureToggleCacheReadModel,
        eventStore: IEventStore,
        configurationRevisionService: ConfigurationRevisionService,
        flagResolver: IFlagResolver,
    ) {
        this.eventStore = eventStore;
        this.configurationRevisionService = configurationRevisionService;
        this.clientFeatureToggleCacheReadModel =
            clientFeatureToggleCacheReadModel;
        this.flagResolver = flagResolver;
        this.onUpdateRevisionEvent = this.onUpdateRevisionEvent.bind(this);
        this.cache = {};

        this.initRevisionId();
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
    ): Promise<RevisionCacheEntry | undefined> {
        const projects = query.project ? query.project : ['*'];
        const environment = query.environment ? query.environment : 'default';
        // TODO: filter by tags, what is namePrefix? anything else?
        const requiredRevisionId = sdkRevisionId || 0;

        const hasCache = this.cache[environment] !== undefined;

        if (!hasCache) {
            await this.initEnvironmentCache(environment);
        }

        // Should get the latest state if revision does not exist or if sdkRevision is not present
        // We should be able to do this without going to the database by merging revisions from the cache with
        // the base case
        const firstTimeCalling = !sdkRevisionId;
        if (
            firstTimeCalling ||
            (sdkRevisionId &&
                sdkRevisionId !== this.currentRevisionId &&
                !this.cache[environment].hasRevision(sdkRevisionId))
        ) {
            //TODO: populate cache based on this?
            return {
                revisionId: this.currentRevisionId,
                // @ts-ignore
                updated: await this.getClientFeatures({ environment }),
                removed: [],
            };
        }

        if (requiredRevisionId >= this.currentRevisionId) {
            return undefined;
        }

        const environmentRevisions = this.cache[environment].getRevisions();

        const compressedRevision = calculateRequiredClientRevision(
            environmentRevisions,
            requiredRevisionId,
            projects,
        );

        return Promise.resolve(compressedRevision);
    }

    private async onUpdateRevisionEvent() {
        if (this.flagResolver.isEnabled('deltaApi')) {
            await this.listenToRevisionChange();
        }
    }

    public async listenToRevisionChange() {
        const keys = Object.keys(this.cache);

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
            .filter((event) => event.type === 'feature-deleted')
            .map((event) => event.featureName!);

        // TODO: we might want to only update the environments that had events changed for performance
        for (const environment of keys) {
            const newToggles = await this.getChangedToggles(
                environment,
                changedToggles,
            );
            this.cache[environment].addRevision({
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
    ): Promise<FeatureConfigurationCacheClient[]> {
        const foundToggles = await this.getClientFeatures({
            toggleNames: toggles,
            environment,
        });
        return foundToggles;
    }

    public async initEnvironmentCache(environment: string) {
        // Todo: replace with method that gets all features for an environment
        const baseFeatures = await this.getClientFeatures({
            environment,
        });

        this.currentRevisionId =
            await this.configurationRevisionService.getMaxRevisionId();

        const cache = new RevisionCache([
            {
                revisionId: this.currentRevisionId,
                updated: baseFeatures,
                removed: [],
            },
        ]);

        this.cache[environment] = cache;
    }

    async getClientFeatures(
        query: IFeatureToggleCacheQuery,
    ): Promise<FeatureConfigurationCacheClient[]> {
        const result =
            await this.clientFeatureToggleCacheReadModel.getAll(query);
        return result;
    }
}
