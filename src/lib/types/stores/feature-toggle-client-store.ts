import { IFeatureToggleClient, IFeatureToggleQuery } from '../model';

export interface IFeatureToggleClientStore {
    getClient(
        featureQuery: Partial<IFeatureToggleQuery>,
    ): Promise<IFeatureToggleClient[]>;

    // @Deprecated
    getAdmin(
        featureQuery: Partial<IFeatureToggleQuery>,
        archived: boolean,
    ): Promise<IFeatureToggleClient[]>;
}
