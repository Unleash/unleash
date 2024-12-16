import type { IFeatureToggleQuery } from '../../../types';
import type { FeatureConfigurationClient } from '../../feature-toggle/types/feature-toggle-strategies-store-type';

export interface FeatureConfigurationDeltaClient
    extends FeatureConfigurationClient {
    description: string;
    impressionData: false;
}

export interface IClientFeatureToggleDeltaReadModel {
    getAll(
        featureQuery: IFeatureToggleQuery,
    ): Promise<FeatureConfigurationDeltaClient[]>;
}
