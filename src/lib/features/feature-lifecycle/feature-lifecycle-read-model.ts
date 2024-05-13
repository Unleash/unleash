import type { Db } from '../../db/db';
import type { IFeatureLifecycleReadModel } from './feature-lifecycle-read-model-type';
import { getCurrentStage } from './get-current-stage';
import type { IFeatureLifecycleStage, StageName } from '../../types';

type DBType = {
    feature: string;
    stage: StageName;
    status: string | null;
    created_at: Date;
};

export class FeatureLifecycleReadModel implements IFeatureLifecycleReadModel {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async findCurrentStage(
        feature: string,
    ): Promise<IFeatureLifecycleStage | undefined> {
        const results = await this.db('feature_lifecycles')
            .where({ feature })
            .orderBy('created_at', 'asc');

        const stages = results.map(({ stage, status, created_at }: DBType) => ({
            stage,
            ...(status ? { status } : {}),
            enteredStageAt: created_at,
        }));

        return getCurrentStage(stages);
    }
}
