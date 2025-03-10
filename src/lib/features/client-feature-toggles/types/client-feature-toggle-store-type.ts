import type {
    IFeatureToggleClient,
    IFeatureToggleQuery,
} from '../../../types/model';

export interface IFeatureToggleClientStore {
    getClient(
        featureQuery: Partial<IFeatureToggleQuery>,
    ): Promise<IFeatureToggleClient[]>;

    getFrontendApiClient(
        featureQuery: Partial<IFeatureToggleQuery>,
    ): Promise<IFeatureToggleClient[]>;

    getPlayground(
        featureQuery: Partial<IFeatureToggleQuery>,
    ): Promise<IFeatureToggleClient[]>;
}
