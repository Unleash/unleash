import type EventEmitter from 'events';
import type { Segment } from 'unleash-client/lib/strategy/strategy';
import type { FeatureInterface } from 'unleash-client/lib/feature';
import type { IApiUser } from '../../../types/api-user';
import type {
    BaseEvent,
    FeatureDependencyAddedEvent,
    IEventStore,
    IFeatureToggleClient,
    IFeatureToggleClientStore,
    IFeatureToggleQuery,
} from '../../../types';
import { mapFeatureForClient } from '../../playground/offline-unleash-client';
import { ALL_ENVS } from '../../../util/constants';
import { UPDATE_REVISION } from '../../feature-toggle/configuration-revision-service';
import * as jsonpatch from 'fast-json-patch';
import type { ClientFeatureSchema } from '../../../openapi';
import type { FeatureConfigurationClient } from '../../feature-toggle/types/feature-toggle-strategies-store-type';
import { NotFoundError } from '../../../error';

type DeletedFeature = {
    name: string;
    project: string;
};

export type ClientFeatureChange = {
    updated: CachedClientFeature[];
    removed: DeletedFeature[];
    maxRevision: number;
};

interface CachedClientFeature extends ClientFeatureSchema {
    project: string;
}

type Revision = {
    revisionId: number;
    updated: any;
    type: string;
};

type RevisionCache = Record<string, Revision[]>;

export type GlobalFrontendApiCacheState = 'starting' | 'ready' | 'updated';

const handleFeatureDependencyAdded = (
    event: FeatureDependencyAddedEvent,
): jsonpatch.Operation[] => {
    const patch: jsonpatch.Operation[] = [
        {
            op: 'add',
            path: '/features/0/dependencies',
            value: [],
        },
    ];
    return patch;
};

export const eventToDiff = (event: BaseEvent) => {
    const handlingStrategies = {
        FEATURE_DEPENDENCY_ADDED: handleFeatureDependencyAdded,
    };

    handlingStrategies[event.type](event);
};

export const applyPatch = (original: any, patch: jsonpatch.Operation[]) => {
    return jsonpatch.applyPatch(original, patch).newDocument;
};

export class ClientFeatureToggleCache {
    private readonly configurationRevisionService: EventEmitter;

    private clientFeatureToggleStore: IFeatureToggleClientStore;

    private cache: RevisionCache = {};

    private segments: Segment[] = [];

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

        this.interval = setInterval(() => this.pollEvents(), 1000);
    }

    async getDelta(
        revisionId: number | undefined,
        environment: string,
        projects: string[] | undefined,
    ): Promise<ClientFeatureChange> {
        const change: ClientFeatureChange = {
            updated: [],
            removed: [],
            maxRevision: this.currentRevisionId,
        };

        if (revisionId === undefined) {
            throw new Error(
                'This should return all client features but this makes it compile right now',
            );
        }

        const environmentRevisions = this.cache[environment];
        for (let i = this.currentRevisionId; i > revisionId; i--) {
            // TODO: doesn't correctly handle cases where a revision undoes a previous revision's work
            // Also includes the project which should be stripped before sending
            const relevantAdditions =
                environmentRevisions.change.updated.filter((feature) => {
                    if (projects) {
                        return projects.includes(feature.project);
                    } else {
                        return feature.project === 'default';
                    }
                });

            const relevantRemovals = environmentRevisions.change.removed.filter(
                (feature) => {
                    if (projects) {
                        return projects.includes(feature.project);
                    } else {
                        return feature.project === 'default';
                    }
                },
            );

            change.removed.push(...relevantRemovals);
            change.updated.push(...relevantAdditions);
        }
        return Promise.resolve(change);
    }

    getSegment(id: number): Segment | undefined {
        return this.segments.find((segment) => segment.id === id);
    }

    getToggle(name: string, token: IApiUser): FeatureInterface {
        const features = this.getTogglesByEnvironment(
            this.environmentNameForToken(token),
        );
        return features[name];
    }

    getToggles(token: IApiUser): FeatureInterface[] {
        const features = this.getTogglesByEnvironment(
            this.environmentNameForToken(token),
        );
        return this.filterTogglesByProjects(features, token.projects);
    }

    private filterTogglesByProjects(
        features: Record<string, FeatureInterface>,
        projects: string[],
    ): FeatureInterface[] {
        if (projects.includes('*')) {
            return Object.values(features);
        }
        return Object.values(features).filter(
            (feature) => feature.project && projects.includes(feature.project),
        );
    }

    private getTogglesByEnvironment(
        environment: string,
    ): Record<string, FeatureInterface> {
        const features = this.cache[environment];

        if (features == null) return {};

        return {};
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
                    type: 'update',
                    revisionId: this.currentRevisionId,
                    updated: [defaultCache],
                },
            ],
            development: [
                {
                    type: 'update',
                    revisionId: this.currentRevisionId,
                    updated: [developmentCache],
                },
            ],
            production: [
                {
                    type: 'update',
                    revisionId: this.currentRevisionId,
                    updated: [productionCache],
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

    private environmentNameForToken(token: IApiUser): string {
        if (token.environment === ALL_ENVS) {
            return 'default';
        }
        return token.environment;
    }

    private mapFeatures(
        features: Record<string, Record<string, IFeatureToggleClient>>,
    ): RevisionCache {
        const entries = Object.entries(features).map(([key, value]) => [
            key,
            Object.fromEntries(
                Object.entries(value).map(([innerKey, innerValue]) => [
                    innerKey,
                    mapFeatureForClient(innerValue),
                ]),
            ),
        ]);

        return Object.fromEntries(entries);
    }

    async getClientFeature(
        name: string,
        query?: IFeatureToggleQuery,
    ): Promise<FeatureConfigurationClient> {
        const toggles = await this.getClientFeatures(query);

        const toggle = toggles.find((t) => t.name === name);
        if (!toggle) {
            throw new NotFoundError(`Could not find feature flag ${name}`);
        }
        return toggle;
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
