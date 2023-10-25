import { Logger } from '../../logger';
import {
    IFeatureStrategiesStore,
    IUnleashConfig,
    IUnleashStores,
} from '../../types';

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

    async search(query: string, tags: string[]) {
        const features = await this.featureStrategiesStore.getFeatureOverview({
            projectId: 'default',
        });

        return features;
        // Search for features
    }
}
