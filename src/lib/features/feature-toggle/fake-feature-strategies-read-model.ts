import type { IFeatureStrategiesReadModel } from './types/feature-strategies-read-model-type.js';

export class FakeFeatureStrategiesReadModel
    implements IFeatureStrategiesReadModel
{
    async getMaxFeatureEnvironmentStrategies(): Promise<{
        feature: string;
        environment: string;
        count: number;
    } | null> {
        return null;
    }

    async getMaxFeatureStrategies(): Promise<{
        feature: string;
        count: number;
    } | null> {
        return null;
    }

    async getMaxConstraintValues(): Promise<{
        feature: string;
        environment: string;
        count: number;
    } | null> {
        return null;
    }

    async getMaxConstraintsPerStrategy(): Promise<{
        feature: string;
        environment: string;
        count: number;
    } | null> {
        return null;
    }
}
