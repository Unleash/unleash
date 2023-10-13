import {
    IFeatureToggleClient,
    IFeatureToggleQuery,
} from '../../../types/model';
import { IGetAdminFeatures } from '../client-feature-toggle-store';

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
