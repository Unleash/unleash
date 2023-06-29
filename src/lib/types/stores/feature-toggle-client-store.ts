import { IFeatureToggleClient, IFeatureToggleQuery } from '../model';
import { IGetAdminFeatures } from '../../db/feature-toggle-client-store';

type OptionalClientFeatureData = 'strategy IDs' | 'strategy titles';
export type OptionalClientFeatures = Set<OptionalClientFeatureData>;

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
