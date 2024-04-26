import type {
    FeatureLifecycleStage,
    IFeatureLifecycleStore,
    FeatureLifecycleView,
} from './feature-lifecycle-store-type';
import type { Db } from '../../db/db';
import type { StageName } from '../../types';

type DBType = {
    feature: string;
    stage: StageName;
    created_at: Date;
};

export class FeatureLifecycleStore implements IFeatureLifecycleStore {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async insert(
        featureLifecycleStages: FeatureLifecycleStage[],
    ): Promise<void> {
        await this.db('feature_lifecycles')
            .insert(
                featureLifecycleStages.map((stage) => ({
                    feature: stage.feature,
                    stage: stage.stage,
                })),
            )
            .returning('*')
            .onConflict(['feature', 'stage'])
            .ignore();
    }

    async get(feature: string): Promise<FeatureLifecycleView> {
        const results = await this.db('feature_lifecycles')
            .where({ feature })
            .orderBy('created_at', 'asc');

        return results.map(({ stage, created_at }: DBType) => ({
            stage,
            enteredStageAt: created_at,
        }));
    }

    async delete(feature: string): Promise<void> {
        await this.db('feature_lifecycles').where({ feature }).del();
    }

    async deleteStage(stage: FeatureLifecycleStage): Promise<void> {
        await this.db('feature_lifecycles')
            .where({
                stage: stage.stage,
                feature: stage.feature,
            })
            .del();
    }

    async stageExists(stage: FeatureLifecycleStage): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1 FROM feature_lifecycles WHERE stage = ? and feature = ?) AS present`,
            [stage.stage, stage.feature],
        );
        const { present } = result.rows[0];
        return present;
    }
}
