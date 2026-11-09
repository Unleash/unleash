import type {
    IFeatureStrategiesReadModel,
    StrategyVariantJsonPayload,
} from './types/feature-strategies-read-model-type.js';

export class FakeFeatureStrategiesReadModel
    implements IFeatureStrategiesReadModel
{
    private variantJsonPayloads = new Map<
        string,
        StrategyVariantJsonPayload[]
    >();

    setVariantJsonPayloads(
        featureName: string,
        payloads: StrategyVariantJsonPayload[],
    ): void {
        this.variantJsonPayloads.set(featureName, payloads);
    }

    async getVariantJsonPayloads(
        featureName: string,
    ): Promise<StrategyVariantJsonPayload[]> {
        return this.variantJsonPayloads.get(featureName) ?? [];
    }

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
