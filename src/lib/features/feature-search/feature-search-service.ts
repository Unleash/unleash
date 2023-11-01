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
        // fetch one more item than needed to get a cursor of the next item
        const { features, total } =
            await this.featureStrategiesStore.searchFeatures({
                ...params,
                limit: params.limit + 1,
            });

        const nextCursor =
            features.length > params.limit
                ? features[features.length - 1].createdAt.toJSON()
                : undefined;

        // do not return the items with the next cursor
        return {
            features:
                features.length > params.limit
                    ? features.slice(0, -1)
                    : features,
            nextCursor,
            total,
        };
    }
}
