import {
    FeatureToggleWithEnvironment,
    IFeatureStrategy,
    IFeatureToggleClient,
    IFeatureToggleQuery,
    IStrategyConfig,
    IVariant,
} from '../model';
import { Store } from './store';

export interface FeatureConfigurationClient {
    name: string;
    type: string;
    enabled: boolean;
    stale: boolean;
    strategies: IStrategyConfig[];
    variants: IVariant[];
}
export interface IFeatureStrategiesStore
    extends Store<IFeatureStrategy, string> {
    createStrategyConfig(
        strategyConfig: Omit<IFeatureStrategy, 'id' | 'createdAt'>,
    ): Promise<IFeatureStrategy>;
    getStrategiesForToggle(featureName: string): Promise<IFeatureStrategy[]>;
    getAllFeatureStrategies(): Promise<IFeatureStrategy[]>;
    getStrategiesForEnvironment(
        environment: string,
    ): Promise<IFeatureStrategy[]>;
    removeAllStrategiesForEnv(
        feature_name: string,
        environment: string,
    ): Promise<void>;
    getAll(): Promise<IFeatureStrategy[]>;
    getStrategiesForFeature(
        project_name: string,
        feature_name: string,
        environment: string,
    ): Promise<IFeatureStrategy[]>;
    getStrategiesForEnv(environment: string): Promise<IFeatureStrategy[]>;
    getFeatureToggleAdmin(
        featureName: string,
        archived?: boolean,
    ): Promise<FeatureToggleWithEnvironment>;
    getFeatures(
        featureQuery: Partial<IFeatureToggleQuery>,
        archived: boolean,
        isAdmin: boolean,
    ): Promise<IFeatureToggleClient[]>;
    getStrategyById(id: string): Promise<IFeatureStrategy>;
    updateStrategy(
        id: string,
        updates: Partial<IFeatureStrategy>,
    ): Promise<IFeatureStrategy>;
    getStrategiesAndMetadataForEnvironment(
        environment: string,
        featureName: string,
    ): Promise<void>;
    deleteConfigurationsForProjectAndEnvironment(
        projectId: String,
        environment: String,
    ): Promise<void>;
}
