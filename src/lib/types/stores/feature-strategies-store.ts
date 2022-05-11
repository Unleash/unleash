import { FeatureToggleWithEnvironment, IFeatureOverview } from '../model';
import { Store } from './store';
import { StrategySchema } from '../../openapi/spec/strategy-schema';
import { VariantSchema } from '../../openapi/spec/variant-schema';
import { FeatureStrategySchema } from '../../openapi/spec/feature-strategy-schema';

export interface FeatureConfigurationClient {
    name: string;
    type: string;
    enabled: boolean;
    stale: boolean;
    strategies: StrategySchema[];
    variants: VariantSchema[];
}
export interface IFeatureStrategiesStore
    extends Store<FeatureStrategySchema, string> {
    createStrategyFeatureEnv(
        strategyConfig: Omit<FeatureStrategySchema, 'id' | 'createdAt'>,
    ): Promise<FeatureStrategySchema>;
    removeAllStrategiesForFeatureEnv(
        featureName: string,
        environment: string,
    ): Promise<void>;
    getStrategiesForFeatureEnv(
        projectId: string,
        featureName: string,
        environment: string,
    ): Promise<FeatureStrategySchema[]>;
    getFeatureToggleWithEnvs(
        featureName: string,
        archived?: boolean,
    ): Promise<FeatureToggleWithEnvironment>;
    getFeatureOverview(
        projectId: string,
        archived: boolean,
    ): Promise<IFeatureOverview[]>;
    getStrategyById(id: string): Promise<FeatureStrategySchema>;
    updateStrategy(
        id: string,
        updates: Partial<FeatureStrategySchema>,
    ): Promise<FeatureStrategySchema>;
    deleteConfigurationsForProjectAndEnvironment(
        projectId: String,
        environment: String,
    ): Promise<void>;
    setProjectForStrategiesBelongingToFeature(
        featureName: string,
        newProjectId: string,
    ): Promise<void>;
    getStrategiesBySegment(segmentId: number): Promise<FeatureStrategySchema[]>;
}
