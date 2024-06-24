import type { IFeatureSearchOverview } from '../../types';
import type {
    IFeatureSearchParams,
    IQueryParam,
} from '../feature-toggle/types/feature-toggle-strategies-store-type';
import type { IFeatureSearchStore } from './feature-search-store-type';

export default class FakeFeatureSearchStore implements IFeatureSearchStore {
    searchFeatures(
        params: IFeatureSearchParams,
        queryParams: IQueryParam[],
    ): Promise<{ features: IFeatureSearchOverview[]; total: number }> {
        throw new Error('Method not implemented.');
    }
}
