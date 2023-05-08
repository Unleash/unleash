import { IUnleashConfig, IUnleashServices } from '../types';
import { Logger } from '../logger';
import { IFeatureToggleQuery } from '../types/model';
import { FeatureConfigurationClient } from '../types/stores/feature-strategies-store';
import FeatureToggleService from './feature-toggle-service';
import EventService from './event-service';
import EventEmitter from 'events';
import hashSum from 'hash-sum';

export interface ClientFeatureQuery extends IFeatureToggleQuery {
    includeIds?: boolean;
    includeDisabledStrategies?: boolean;
}

export declare enum ClientFeaturesEvent {
    Ready = 'ready',
    Changed = 'changed',
    Synchronized = 'synchronized',
}

type QueryHash = string;

type CacheStats = {
    hits: number;
    updates: number;
    lastUpdated?: Date;
};

// TODO add metrics
// TODO add TTL based on last accessed to save memory
class FeaturesCache {
    private readonly logger: Logger;

    private readonly query: ClientFeatureQuery;

    private readonly featureToggleServiceV2: FeatureToggleService;

    private features: FeatureConfigurationClient[];

    private cacheStats: CacheStats;

    constructor(
        query: ClientFeatureQuery,
        featureToggleServiceV2: FeatureToggleService,
    ) {
        this.query = query;
        this.featureToggleServiceV2 = featureToggleServiceV2;
        this.cacheStats = {
            hits: 0, // hits since last update? or since start (it may overflow quickly)?
            updates: 0,
        };
    }

    async getFeatures(): Promise<FeatureConfigurationClient[]> {
        if (!this.features) {
            this.features = await this.featureToggleServiceV2.getClientFeatures(
                this.query,
                this.query.includeIds,
                this.query.includeDisabledStrategies,
            );
            this.cacheStats.updates += 1;
            this.cacheStats.lastUpdated = new Date();
        }
        return this.features;
    }
}

export default class ClientFeatures extends EventEmitter {
    private readonly logger: Logger;

    private featureToggleServiceV2: FeatureToggleService;

    private eventService: EventService;

    private readonly clientFeatures: Map<QueryHash, FeaturesCache>;

    constructor(
        config: Pick<IUnleashConfig, 'getLogger'>,
        {
            featureToggleServiceV2,
            eventService,
        }: Pick<IUnleashServices, 'featureToggleServiceV2' | 'eventService'>,
    ) {
        super();
        this.logger = config.getLogger('services/client-features.ts');
        this.featureToggleServiceV2 = featureToggleServiceV2;
        this.eventService = eventService;
    }

    // TODO we should have also getEvaluatedFeatures stored in a different cache
    async getFeatures(
        query: ClientFeatureQuery = {},
    ): Promise<FeatureConfigurationClient[]> {
        const cache = await this.getCacheFor(query);
        return cache.getFeatures();
    }

    async getCacheFor(query: ClientFeatureQuery): Promise<FeaturesCache> {
        const queryHash = await this.versionedHash(query);
        let cache = this.clientFeatures.get(queryHash);
        if (!cache) {
            cache = new FeaturesCache(query, this.featureToggleServiceV2);
            this.clientFeatures.set(queryHash, cache);
        }
        return cache;
    }

    async versionedHash(query: ClientFeatureQuery): Promise<QueryHash> {
        const revisionId = await this.eventService.getMaxRevisionId();
        const queryHash = hashSum(query); // assuming collision chance is low
        return `${queryHash}:${revisionId}`;
    }

    async start(): Promise<void> {
        this.eventService.on('update', this.onAnyEvent);
    }
}
