import {
    FeatureToggleWithEnvironment,
    IFeatureOverview,
    IFeatureStrategy,
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
    createStrategyFeatureEnv(
        strategyConfig: Omit<IFeatureStrategy, 'id' | 'createdAt'>,
    ): Promise<IFeatureStrategy>;
    removeAllStrategiesForFeatureEnv(
        featureName: string,
        environment: string,
    ): Promise<void>;
    getStrategiesForFeatureEnv(
        projectId: string,
        featureName: string,
        environment: string,
    ): Promise<IFeatureStrategy[]>;
    getFeatureToggleWithEnvs(
        featureName: string,
        archived?: boolean,
    ): Promise<FeatureToggleWithEnvironment>;
    getFeatureOverview(
        projectId: string,
        archived: boolean,
    ): Promise<IFeatureOverview[]>;
    getStrategyById(id: string): Promise<IFeatureStrategy>;
    updateStrategy(
        id: string,
        updates: Partial<IFeatureStrategy>,
    ): Promise<IFeatureStrategy>;
    deleteConfigurationsForProjectAndEnvironment(
        projectId: String,
        environment: String,
    ): Promise<void>;
    setProjectForStrategiesBelongingToFeature(
        featureName: string,
        newProjectId: string,
    ): Promise<void>;
    getStrategiesBySegment(segmentId: number): Promise<IFeatureStrategy[]>;
}
