import type { IFeatureSearchOverview } from '../../types/index.js';
import type {
    IFeatureSearchParams,
    IQueryParam,
} from '../feature-toggle/types/feature-toggle-strategies-store-type.js';
import type { IFeatureSearchStore } from './feature-search-store-type.js';

export default class FakeFeatureSearchStore implements IFeatureSearchStore {
    searchFeatures(
        _params: IFeatureSearchParams,
        _queryParams: IQueryParam[],
    ): Promise<{ features: IFeatureSearchOverview[]; total: number }> {
        throw new Error('Method not implemented.');
    }
}
