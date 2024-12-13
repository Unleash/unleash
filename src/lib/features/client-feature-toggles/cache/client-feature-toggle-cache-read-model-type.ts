import type { IFeatureToggleQuery } from '../../../types';
import type { FeatureConfigurationClient } from '../../feature-toggle/types/feature-toggle-strategies-store-type';

export interface FeatureConfigurationCacheClient
    extends FeatureConfigurationClient {
    description: string;
    impressionData: false;
}

export interface IClientFeatureToggleCacheReadModel {
    getAll(
        featureQuery: IFeatureToggleQuery,
    ): Promise<FeatureConfigurationCacheClient[]>;
}
