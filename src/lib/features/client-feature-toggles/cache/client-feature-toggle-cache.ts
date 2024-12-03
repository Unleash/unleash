import type EventEmitter from 'events';
import type {
    IEventStore,
    IFeatureToggleClientStore,
    IFeatureToggleQuery,
} from '../../../types';
import { UPDATE_REVISION } from '../../feature-toggle/configuration-revision-service';
import type { ClientFeatureSchema } from '../../../openapi';
import type { FeatureConfigurationClient } from '../../feature-toggle/types/feature-toggle-strategies-store-type';

type DeletedFeature = {
    name: string;
    project: string;
};

export type ClientFeatureChange = {
    updated: CachedClientFeature[];
    removed: DeletedFeature[];
    revisionId: number;
};

interface CachedClientFeature extends ClientFeatureSchema {
    project: string;
}

type Revision = {
    revisionId: number;
    updated: any[];
    removed: DeletedFeature[];
};

type RevisionCache = Record<string, Revision[]>;

export const compressRevisionList = (
    revisions: Revision[],
): ClientFeatureChange => {
    const compressedRevisions = revisions.reduce(compressRevisions);
    return {
        updated: compressedRevisions.updated,
        removed: compressedRevisions.removed,
        revisionId: compressedRevisions.revisionId,
    };
};

export const compressRevisions = (
    first: Revision,
    last: Revision,
): Revision => {
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

    for (const name of last.removed.map((f) => f.name)) {
        updatedMap.delete(name);
    }

    for (const name of last.updated.map((f) => f.name)) {
        removedMap.delete(name);
    }

    return {
        revisionId: last.revisionId,
        updated: Array.from(updatedMap.values()),
        removed: Array.from(removedMap.values()),
    };
};

export const filterRevisionByProject = (
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

export class ClientFeatureToggleCache {
    private readonly configurationRevisionService: EventEmitter;

    private clientFeatureToggleStore: IFeatureToggleClientStore;

    private cache: RevisionCache = {};

    private eventStore: IEventStore;

    private currentRevisionId: number = 0;

    private interval: NodeJS.Timer;

    constructor(
        clientFeatureToggleStore: IFeatureToggleClientStore,
        eventStore: IEventStore,
        configurationRevisionService: EventEmitter,
    ) {
        this.eventStore = eventStore;
        this.configurationRevisionService = configurationRevisionService;
        this.clientFeatureToggleStore = clientFeatureToggleStore;
        this.onUpdateRevisionEvent = this.onUpdateRevisionEvent.bind(this);

        this.configurationRevisionService.on(
            UPDATE_REVISION,
            this.onUpdateRevisionEvent,
        );
    }

    async initialize() {
        // This needs to be one call so that we can associate the base caches with
        // a revision id
        this.currentRevisionId = await this.eventStore.getMaxRevisionId();
        this.initCache();

        // this.interval = setInterval(() => this.pollEvents(), 1000);
    }

    async getDelta(
        sdkRevisionId: number | undefined,
        environment: string,
        projects: string[],
    ): Promise<ClientFeatureChange> {
        const requiredRevisionId = sdkRevisionId || 0;
        const revisions = this.cache[environment];
        const revisionList = revisions
            .filter((revision) => revision.revisionId > requiredRevisionId)
            .map((revision) => filterRevisionByProject(revision, projects));
        const compressedRevision = compressRevisionList(revisionList);

        return Promise.resolve(compressedRevision);
    }

    private async onUpdateRevisionEvent() {
        await this.pollEvents();
    }

    public async pollEvents() {
        console.log("I'm polling!");
        // use scheduler service
        // Pull all events from the current revisionId
        // Find a list of every flag that changed in each environment and associate that with
        // the revisionId
        // Get those flags from the database
        // Build the data structure for the cache
        // Update the relevant environment cache with the new update
    }

    public async initCache() {
        //TODO: This only returns stuff for the default environment!!! Need to pass a query to get the relevant environment
        // featuresByEnvironment cache

        // The base cache is a record of <environment, array>
        // Each array holds a collection of objects that contains the revisionId and which
        // flags changed in each revision. It also holds a type that informs us whether or not
        // the revision is the base case or if is an update or remove operation

        // To get the base for each cache we need to get all features for all environments and the max revision id

        // hardcoded for now
        // const environments = ["default", "development", "production"];
        const defaultCache = await this.getClientFeatures({
            environment: 'default ',
        });
        const developmentCache = this.getClientFeatures({
            environment: 'development ',
        });
        const productionCache = this.getClientFeatures({
            environment: 'production ',
        });
        // Always assume that the first item of the array is the base
        const cache = {
            default: [
                {
                    revisionId: this.currentRevisionId,
                    updated: [defaultCache],
                    removed: [],
                },
            ],
            development: [
                {
                    revisionId: this.currentRevisionId,
                    updated: [developmentCache],
                    removed: [],
                },
            ],
            production: [
                {
                    revisionId: this.currentRevisionId,
                    updated: [productionCache],
                    removed: [],
                },
            ],
        };

        this.cache = cache;

        // This is what the cache looks like
        // const cache = {
        // 	Default: [
        // 		{
        // 			type: "update",
        // 			revisionId: 4,
        // 			updated: [
        // 				{
        // 					name: "counter",
        // 					type: "release",
        //                     ...
        // 				},
        // 			],
        // 		},
        //         {
        //             type: "update",
        //             revisionId: 5,
        //             updated: [
        //                 {
        //                     name: "counter",
        //                     type: "release"
        //                     ...
        //                 }
        //             ]
        //         }
        // 	],
        // };

        // const baseCache = await this.getClientFeatures();
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
