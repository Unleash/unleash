import type {
    IFeatureSearchParams,
    IQueryParam,
} from '../feature-toggle/types/feature-toggle-strategies-store-type';
import type { IFeatureSearchOverview } from '../../types';

export interface IFeatureSearchStore {
    searchFeatures(
        params: IFeatureSearchParams,
        queryParams: IQueryParam[],
    ): Promise<{
        features: IFeatureSearchOverview[];
        total: number;
    }>;
}
