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
    created_at: string;
};

export class FeatureLifecycleStore implements IFeatureLifecycleStore {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async insert(
        featureLifecycleStages: FeatureLifecycleStage[],
    ): Promise<void> {
        const joinedLifecycleStages = featureLifecycleStages
            .map((stage) => `('${stage.feature}', '${stage.stage}')`)
            .join(', ');

        const query = this.db
            .with(
                'new_stages',
                this.db.raw(`
                    SELECT v.feature, v.stage
                    FROM (VALUES ${joinedLifecycleStages}) AS v(feature, stage)
                    JOIN features ON features.name = v.feature
                    LEFT JOIN feature_lifecycles ON feature_lifecycles.feature = v.feature AND feature_lifecycles.stage = v.stage
                    WHERE feature_lifecycles.feature IS NULL AND feature_lifecycles.stage IS NULL
                `),
            )
            .insert((query) => {
                query.select('feature', 'stage').from('new_stages');
            })
            .into('feature_lifecycles')
            .onConflict(['feature', 'stage'])
            .ignore();
        await query;
    }

    async get(feature: string): Promise<FeatureLifecycleView> {
        const results = await this.db('feature_lifecycles')
            .where({ feature })
            .orderBy('created_at', 'asc');

        return results.map(({ stage, created_at }: DBType) => ({
            stage,
            enteredStageAt: new Date(created_at),
        }));
    }

    async getAll(): Promise<FeatureLifecycleFullItem[]> {
        const results = await this.db('feature_lifecycles').orderBy(
            'created_at',
            'asc',
        );

        return results.map(({ feature, stage, created_at }: DBType) => ({
            feature,
            stage,
            enteredStageAt: new Date(created_at),
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
