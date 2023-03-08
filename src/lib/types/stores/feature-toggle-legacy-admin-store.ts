import { IFeatureToggleClient } from '../model';
import { IGetAdminFeatures } from '../../db/feature-toggle-client-store';

export interface IFeatureToggleLegacyAdminStore {
    // @Deprecated
    getAdmin(params: IGetAdminFeatures): Promise<IFeatureToggleClient[]>;
}
