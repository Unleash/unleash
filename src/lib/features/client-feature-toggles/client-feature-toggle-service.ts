import type {
    IFeatureToggleClientStore,
    IFeatureToggleQuery,
    ISegmentReadModel,
    IUnleashConfig,
    IUnleashStores,
} from '../../types';

import type { Logger } from '../../logger';

import type { FeatureConfigurationClient } from '../feature-toggle/types/feature-toggle-strategies-store-type';

export class ClientFeatureToggleService {
    private logger: Logger;

    private clientFeatureToggleStore: IFeatureToggleClientStore;

    private segmentReadModel: ISegmentReadModel;

    constructor(
        {
            clientFeatureToggleStore,
        }: Pick<IUnleashStores, 'clientFeatureToggleStore'>,
        segmentReadModel: ISegmentReadModel,
        { getLogger }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver'>,
    ) {
        this.logger = getLogger('services/client-feature-toggle-service.ts');
        this.segmentReadModel = segmentReadModel;
        this.clientFeatureToggleStore = clientFeatureToggleStore;
    }

    async getActiveSegmentsForClient() {
        return this.segmentReadModel.getActiveForClient();
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
