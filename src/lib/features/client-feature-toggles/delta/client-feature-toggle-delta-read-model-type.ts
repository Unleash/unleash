import type { IFeatureToggleQuery } from '../../../types/index.js';
import type { FeatureConfigurationClient } from '../../feature-toggle/types/feature-toggle-strategies-store-type.js';

export interface FeatureConfigurationDeltaClient
    extends FeatureConfigurationClient {
    description: string;
    impressionData: boolean;
}

export interface IClientFeatureToggleDeltaReadModel {
    getAll(
        featureQuery: IFeatureToggleQuery,
    ): Promise<FeatureConfigurationDeltaClient[]>;
}
