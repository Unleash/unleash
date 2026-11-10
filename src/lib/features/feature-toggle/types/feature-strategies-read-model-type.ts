export type StrategyVariantJsonPayload = {
    strategyId: string;
    variantName: string;
    value: string;
};

export interface IFeatureStrategiesReadModel {
    getVariantJsonPayloads(
        featureName: string,
    ): Promise<StrategyVariantJsonPayload[]>;
    getMaxFeatureEnvironmentStrategies(): Promise<{
        feature: string;
        environment: string;
        count: number;
    } | null>;
    getMaxFeatureStrategies(): Promise<{
        feature: string;
        count: number;
    } | null>;
    getMaxConstraintValues(): Promise<{
        feature: string;
        environment: string;
        count: number;
    } | null>;
    getMaxConstraintsPerStrategy(): Promise<{
        feature: string;
        environment: string;
        count: number;
    } | null>;
}
