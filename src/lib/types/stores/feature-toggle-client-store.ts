import { IFeatureToggleClient, IFeatureToggleQuery } from '../model';

export interface IFeatureToggleClientStore {
    getClient(
        featureQuery: Partial<IFeatureToggleQuery>,
        includeStrategyIds?: boolean,
    ): Promise<IFeatureToggleClient[]>;
}
