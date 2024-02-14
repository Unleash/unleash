import { IFeatureOverview } from '../../types';
import {
    IFeatureSearchParams,
    IQueryParam,
} from '../feature-toggle/types/feature-toggle-strategies-store-type';
import { IFeatureSearchStore } from './feature-search-store-type';

export default class FakeFeatureSearchStore implements IFeatureSearchStore {
    searchFeatures(
        params: IFeatureSearchParams,
        queryParams: IQueryParam[],
    ): Promise<{ features: IFeatureOverview[]; total: number }> {
        throw new Error('Method not implemented.');
    }
}
