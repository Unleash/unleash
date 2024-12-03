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
    IUnleashConfig,
} from '../../../types';
import { mapFeatureForClient } from '../../playground/offline-unleash-client';
import { ALL_ENVS } from '../../../util/constants';
import { UPDATE_REVISION } from '../../feature-toggle/configuration-revision-service';
import * as jsonpatch from 'fast-json-patch';
import type { ClientFeaturesSchema } from '../../../openapi';
import type { FeatureConfigurationClient } from '../../feature-toggle/types/feature-toggle-strategies-store-type';

type Config = Pick<IUnleashConfig, 'getLogger' | 'flagResolver' | 'eventBus'>;

type Revision = {
    revisionId: number;
    patches: jsonpatch.Operation[];
};

type ClientFeatureRecord = {
    revisions: Revision[];
    baseCase: ClientFeaturesSchema;
};

type RevisionCache = Record<string, ClientFeatureRecord>;

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

    private featuresByEnvironment: RevisionCache = {};

    private segments: Segment[] = [];

    private eventStore: IEventStore;

    constructor(
        clientFeatureToggleStore: IFeatureToggleClientStore,
        eventStore: IEventStore,
        configurationRevisionService: EventEmitter,
    ) {
        this.eventStore = eventStore;
        this.configurationRevisionService = configurationRevisionService;
        this.clientFeatureToggleStore = clientFeatureToggleStore;
        this.onUpdateRevisionEvent = this.onUpdateRevisionEvent.bind(this);

        this.populateBaseCaches();
        this.configurationRevisionService.on(
            UPDATE_REVISION,
            this.onUpdateRevisionEvent,
        );
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
        const features = this.featuresByEnvironment[environment];

        if (features == null) return {};

        return {};
    }

    private async onUpdateRevisionEvent() {
        await this.pollEvents();
    }

    public async pollEvents() {}

    public async populateBaseCaches() {
        //TODO: This only returns stuff for the default environment!!! Need to pass a query to get the relevant environment
        const baseCache = await this.getClientFeatures();
        this.featuresByEnvironment.Default = {
            revisions: [],
            baseCase: {
                features: baseCache,
                segments: [], // TODO: mocking segments for now
                version: 2,
            },
        };
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
