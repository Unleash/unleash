import { IFeatureToggleClient, IFeatureToggleQuery } from '../model';
import { IGetAdminFeatures } from '../../db/feature-toggle-client-store';

export interface IFeatureToggleClientStore {
    getClient(
        featureQuery: Partial<IFeatureToggleQuery>,
    ): Promise<IFeatureToggleClient[]>;

    getPlayground(
        featureQuery: Partial<IFeatureToggleQuery>,
    ): Promise<IFeatureToggleClient[]>;

    // @Deprecated
    getAdmin(params: IGetAdminFeatures): Promise<IFeatureToggleClient[]>;
}
