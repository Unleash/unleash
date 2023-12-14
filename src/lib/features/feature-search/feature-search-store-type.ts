import {
    IFeatureSearchParams,
    IQueryParam,
} from '../feature-toggle/types/feature-toggle-strategies-store-type';
import { IFeatureOverview } from '../../types';

export interface IFeatureSearchStore {
    searchFeatures(
        params: IFeatureSearchParams,
        queryParams: IQueryParam[],
    ): Promise<{
        features: IFeatureOverview[];
        total: number;
    }>;
}
