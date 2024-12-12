import type {
    IEventStore,
    IFeatureToggleClient,
    IFeatureToggleClientStore,
    IFeatureToggleQuery,
    IFlagResolver,
} from '../../../types';
import type { FeatureConfigurationClient } from '../../feature-toggle/types/feature-toggle-strategies-store-type';
import type ConfigurationRevisionService from '../../feature-toggle/configuration-revision-service';
import { UPDATE_REVISION } from '../../feature-toggle/configuration-revision-service';
import { RevisionCache } from './revision-cache';

type DeletedFeature = {
    name: string;
    project: string;
};

export type ClientFeatureChange = {
    updated: IFeatureToggleClient[];
    removed: DeletedFeature[];
    revisionId: number;
};

export type Revision = {
    revisionId: number;
    updated: any[];
    removed: DeletedFeature[];
};

type Revisions = Record<string, RevisionCache>;

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

export class ClientFeatureToggleCache {
    private clientFeatureToggleStore: IFeatureToggleClientStore;

    private cache: Revisions = {};

    private eventStore: IEventStore;

    private currentRevisionId: number = 0;

    private interval: NodeJS.Timer;

    private flagResolver: IFlagResolver;

    private configurationRevisionService: ConfigurationRevisionService;

    constructor(
        clientFeatureToggleStore: IFeatureToggleClientStore,
        eventStore: IEventStore,
        configurationRevisionService: ConfigurationRevisionService,
        flagResolver: IFlagResolver,
    ) {
        this.eventStore = eventStore;
        this.configurationRevisionService = configurationRevisionService;
        this.clientFeatureToggleStore = clientFeatureToggleStore;
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
        environment: string,
        projects: string[],
    ): Promise<ClientFeatureChange | undefined> {
        const requiredRevisionId = sdkRevisionId || 0;

        const hasCache = this.cache[environment] !== undefined;

        if (!hasCache) {
            this.initEnvironmentCache(environment);
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
            await this.pollEvents();
        }
    }

    public async pollEvents() {
        const latestRevision =
            await this.configurationRevisionService.getMaxRevisionId();

        if (this.currentRevisionId === 0) {
            await this.populateBaseCache(latestRevision);
        } else {
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
            const newToggles = await this.getChangedToggles(
                changedToggles,
                latestRevision, // TODO: this should come back from the same query to not be out of sync
            );

            if (this.cache.development) {
                this.cache.development.addRevision(newToggles);
            }
        }
        this.currentRevisionId = latestRevision;
    }

    private async populateBaseCache(latestRevisionId: number) {
        const features = await this.getClientFeatures({
            environment: 'development',
        });

        if (this.cache.development) {
            this.cache.development.addRevision({
                updated: features as any, //impressionData is not on the type but should be
                removed: [],
                revisionId: latestRevisionId,
            });
        }
        console.log(`Populated base cache with ${features.length} features`);
    }

    async getChangedToggles(
        toggles: string[],
        revisionId: number,
    ): Promise<ClientFeatureChange> {
        const foundToggles = await this.getClientFeatures({
            // @ts-ignore removed toggleNames from the type, we should not use this method at all,
            toggleNames: toggles,
            environment: 'development',
        });

        const foundToggleNames = foundToggles.map((toggle) => toggle.name);
        const removed = toggles
            .filter((toggle) => !foundToggleNames.includes(toggle))
            .map((name) => ({
                name,
                project: 'default', // TODO: this needs to be smart and figure out the project . IMPORTANT
            }));

        return {
            updated: foundToggles as any, // impressionData is not on the type but should be
            removed,
            revisionId,
        };
    }

    public async initEnvironmentCache(environment: string) {
        // Todo: replace with method that gets all features for an environment
        const baseFeatures = await this.getClientFeatures({
            environment,
        });

        this.latestRevision =
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
        query?: IFeatureToggleQuery,
    ): Promise<FeatureConfigurationClient[]> {
        const result = await this.clientFeatureToggleStore.getClient(
            query || {},
        );

        return result.map(
            ({
                name,
                type,
                enabled,
                project,
                stale,
                strategies,
                variants,
                description,
                impressionData,
                dependencies,
            }) => ({
                name,
                type,
                enabled,
                project,
                stale,
                strategies,
                variants,
                description,
                impressionData,
                dependencies,
            }),
        );
    }
}
