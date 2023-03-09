import { FeatureToggle } from '../model';
import { IGetAdminFeatures } from '../../db/feature-toggle-client-store';

export interface IFeatureToggleAdminStore {
    getAdmin(params: IGetAdminFeatures): Promise<FeatureToggle[]>;
}
