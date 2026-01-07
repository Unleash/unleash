import type {
    FeatureLifecycleStage,
    IFeatureLifecycleStore,
    FeatureLifecycleView,
    NewStage,
} from './feature-lifecycle-store-type.js';

export class FakeFeatureLifecycleStore implements IFeatureLifecycleStore {
    private lifecycles: Record<string, FeatureLifecycleView> = {};

    async insert(
        featureLifecycleStages: FeatureLifecycleStage[],
    ): Promise<NewStage[]> {
        const results = await Promise.all(
            featureLifecycleStages.map(async (stage) => {
                const success = await this.insertOne(stage);
                if (success) {
                    return {
                        feature: stage.feature,
                        stage: stage.stage,
                    };
                }
                return null;
            }),
        );
        return results.filter((result) => result !== null) as NewStage[];
    }

    private async insertOne(
        featureLifecycleStage: FeatureLifecycleStage,
    ): Promise<boolean> {
        if (await this.stageExists(featureLifecycleStage)) {
            return false;
        }
        const _newStages: NewStage[] = [];
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
        return true;
    }

    async get(feature: string): Promise<FeatureLifecycleView> {
        return this.lifecycles[feature] || [];
    }

    async delete(feature: string): Promise<void> {
        this.lifecycles[feature] = [];
    }

    async deleteAll(): Promise<void> {
        this.lifecycles = {};
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
