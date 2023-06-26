import { IFeatureToggleClient, IFeatureToggleQuery } from '../model';
import { IGetAdminFeatures } from '../../db/feature-toggle-client-store';

export type OptionalClientFeatureData = 'strategy IDs' | 'strategy titles';

export interface IFeatureToggleClientStore {
    getClient(
        featureQuery: Partial<IFeatureToggleQuery>,
        optionalIncludes?: OptionalClientFeatureData[],
    ): Promise<IFeatureToggleClient[]>;

    // @Deprecated
    getAdmin(params: IGetAdminFeatures): Promise<IFeatureToggleClient[]>;
}
