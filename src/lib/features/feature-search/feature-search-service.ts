import { Logger } from '../../logger';
import {
    IFeatureStrategiesStore,
    IUnleashConfig,
    IUnleashStores,
} from '../../types';
import { FeatureSearchQueryParameters } from '../../openapi/spec/feature-search-query-parameters';

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

    async search(params: FeatureSearchQueryParameters) {
        const features = await this.featureStrategiesStore.getFeatureOverview({
            projectId: params.projectId,
            namePrefix: params.query,
        });

        return features;
    }
}
