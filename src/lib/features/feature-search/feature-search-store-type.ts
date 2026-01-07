import type {
    IFeatureSearchParams,
    IQueryParam,
} from '../feature-toggle/types/feature-toggle-strategies-store-type.js';
import type { IFeatureSearchOverview } from '../../types/index.js';

export interface IFeatureSearchStore {
    searchFeatures(
        params: IFeatureSearchParams,
        queryParams: IQueryParam[],
    ): Promise<{
        features: IFeatureSearchOverview[];
        total: number;
    }>;
}
