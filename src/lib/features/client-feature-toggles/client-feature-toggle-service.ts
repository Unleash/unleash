import type {
    IFeatureToggleClientStore,
    IFeatureToggleQuery,
    ISegmentReadModel,
    IUnleashConfig,
    IUnleashStores,
} from '../../types';

import type { Logger } from '../../logger';

import type { FeatureConfigurationClient } from '../feature-toggle/types/feature-toggle-strategies-store-type';
import type {
    ClientFeatureChange,
    ClientFeatureToggleCache,
} from './cache/client-feature-toggle-cache';

export class ClientFeatureToggleService {
    private logger: Logger;

    private clientFeatureToggleStore: IFeatureToggleClientStore;

    private segmentReadModel: ISegmentReadModel;

    private clientFeatureToggleCache: ClientFeatureToggleCache | null = null;

    constructor(
        {
            clientFeatureToggleStore,
        }: Pick<IUnleashStores, 'clientFeatureToggleStore'>,
        segmentReadModel: ISegmentReadModel,
        clientFeatureToggleCache: ClientFeatureToggleCache | null,
        { getLogger }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>,
    ) {
        this.logger = getLogger('services/client-feature-toggle-service.ts');
        this.segmentReadModel = segmentReadModel;
        this.clientFeatureToggleCache = clientFeatureToggleCache;
        this.clientFeatureToggleStore = clientFeatureToggleStore;
    }

    async getActiveSegmentsForClient() {
        return this.segmentReadModel.getActiveForClient();
    }

    async getClientDelta(
        revisionId: number | undefined,
        projects: string[],
        environment: string,
    ): Promise<ClientFeatureChange> {
        if (this.clientFeatureToggleCache !== null) {
            return this.clientFeatureToggleCache.getDelta(
                revisionId,
                environment,
                projects,
            );
        } else {
            throw new Error(
                'Calling the partial updates but the cache is not initialized',
            );
        }
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
