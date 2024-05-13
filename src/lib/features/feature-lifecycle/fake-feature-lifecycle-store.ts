import type {
    FeatureLifecycleStage,
    IFeatureLifecycleStore,
    FeatureLifecycleView,
    FeatureLifecycleProjectItem,
} from './feature-lifecycle-store-type';

export class FakeFeatureLifecycleStore implements IFeatureLifecycleStore {
    private lifecycles: Record<string, FeatureLifecycleView> = {};

    async insert(
        featureLifecycleStages: FeatureLifecycleStage[],
    ): Promise<void> {
        await Promise.all(
            featureLifecycleStages.map((stage) => this.insertOne(stage)),
        );
    }

    private async insertOne(
        featureLifecycleStage: FeatureLifecycleStage,
    ): Promise<void> {
        if (await this.stageExists(featureLifecycleStage)) {
            return;
        }
        const existingStages = await this.get(featureLifecycleStage.feature);
        this.lifecycles[featureLifecycleStage.feature] = [
            ...existingStages,
            {
                stage: featureLifecycleStage.stage,
                ...(featureLifecycleStage.status
                    ? { status: featureLifecycleStage.status }
                    : {}),
                enteredStageAt: new Date(),
            },
        ];
    }

    async get(feature: string): Promise<FeatureLifecycleView> {
        return this.lifecycles[feature] || [];
    }

    async getAll(): Promise<FeatureLifecycleProjectItem[]> {
        const result = Object.entries(this.lifecycles).flatMap(
            ([key, items]): FeatureLifecycleProjectItem[] =>
                items.map((item) => ({
                    ...item,
                    feature: key,
                    project: 'fake-project',
                })),
        );
        return result;
    }

    async delete(feature: string): Promise<void> {
        this.lifecycles[feature] = [];
    }

    async stageExists(stage: FeatureLifecycleStage): Promise<boolean> {
        const lifecycle = await this.get(stage.feature);
        return Boolean(lifecycle.find((s) => s.stage === stage.stage));
    }

    async deleteStage(stage: FeatureLifecycleStage): Promise<void> {
        if (!this.lifecycles[stage.feature]) {
            return;
        }
        const updatedStages = this.lifecycles[stage.feature].filter(
            (s) => s.stage !== stage.stage,
        );
        this.lifecycles[stage.feature] = updatedStages;
    }
}
