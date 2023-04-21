import { IFeatureToggleClient, IFeatureToggleQuery } from '../model';
import { IGetAdminFeatures } from '../../db/feature-toggle-client-store';

export interface IFeatureToggleClientStore {
    getClient(
        featureQuery: Partial<IFeatureToggleQuery>,
        includeStrategyIds?: boolean,
        includeDisabledStrategies?: boolean,
    ): Promise<IFeatureToggleClient[]>;

    // @Deprecated
    getAdmin(params: IGetAdminFeatures): Promise<IFeatureToggleClient[]>;
}
