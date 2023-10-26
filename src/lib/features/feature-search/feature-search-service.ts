import { Logger } from '../../logger';
import {
    IFeatureStrategiesStore,
    IUnleashConfig,
    IUnleashStores,
} from '../../types';
import { IFeatureSearchParams } from '../feature-toggle/types/feature-toggle-strategies-store-type';

export class FeatureSearchService {
    private featureStrategiesStore: IFeatureStrategiesStore;
    private logger: Logger;
    constructor(
        {
            featureStrategiesStore,
        }: Pick<IUnleashStores, 'featureStrategiesStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.featureStrategiesStore = featureStrategiesStore;
        this.logger = getLogger('services/feature-search-service.ts');
    }

    async search(params: IFeatureSearchParams) {
        const features = await this.featureStrategiesStore.searchFeatures({
            projectId: params.projectId,
            query: params.query,
            userId: params.userId,
            type: params.type,
        });

        return features;
    }
}
