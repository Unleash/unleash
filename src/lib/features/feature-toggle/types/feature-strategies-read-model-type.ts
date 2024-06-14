export interface IFeatureStrategiesReadModel {
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
    getMaxProjectFeatures(): Promise<{
        project: string;
        count: number;
    } | null>;
}
