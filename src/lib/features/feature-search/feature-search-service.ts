import { Logger } from '../../logger';
import {
    IFeatureStrategiesStore,
    IUnleashConfig,
    IUnleashStores,
    serializeDates,
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
        const features = await this.featureStrategiesStore.searchFeatures(
            params,
        );

        const nextCursor =
            features.length > 0
                ? features[features.length - 1].createdAt.toJSON()
                : undefined;

        return { features, nextCursor };
    }
}
