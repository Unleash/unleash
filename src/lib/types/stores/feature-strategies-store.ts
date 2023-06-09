import {
    FeatureToggleWithEnvironment,
    IFeatureOverview,
    IFeatureStrategy,
    IStrategyConfig,
    IVariant,
} from '../model';
import { Store } from './store';
import { IFeatureProjectUserParams } from '../../routes/admin-api/project/project-features';

export interface FeatureConfigurationClient {
    name: string;
    type: string;
    enabled: boolean;
    project: string;
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
        userId?: number,
        archived?: boolean,
    ): Promise<FeatureToggleWithEnvironment>;
    getFeatureToggleWithVariantEnvs(
        featureName: string,
        userId?: number,
        archived?,
    ): Promise<FeatureToggleWithEnvironment>;
    getFeatureOverview(
        params: IFeatureProjectUserParams,
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
    getStrategiesByContextField(
        contextFieldName: string,
    ): Promise<IFeatureStrategy[]>;
    updateSortOrder(id: string, sortOrder: number): Promise<void>;
    getAllByFeatures(
        features: string[],
        environment?: string,
    ): Promise<IFeatureStrategy[]>;
    getCustomStrategiesInUseCount(): Promise<number>;
}
