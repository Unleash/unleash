import type {
    FeatureLifecycleStage,
    IFeatureLifecycleStore,
    LifecycleView,
} from './feature-lifecycle-store-type';

export class FakeFeatureLifecycleStore implements IFeatureLifecycleStore {
    private lifecycles: Record<string, LifecycleView> = {};

    async insert(featureLifecycleStage: FeatureLifecycleStage): Promise<void> {
        const existing = await this.get(featureLifecycleStage.feature);
        this.lifecycles[featureLifecycleStage.feature] = [
            ...existing,
            {
                stage: featureLifecycleStage.stage,
                enteredStageAt: new Date(),
            },
        ];
    }

    async get(feature: string): Promise<LifecycleView> {
        return this.lifecycles[feature] || [];
    }
}
