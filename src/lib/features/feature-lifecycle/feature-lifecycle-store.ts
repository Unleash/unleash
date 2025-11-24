import type {
    FeatureLifecycleStage,
    IFeatureLifecycleStore,
    FeatureLifecycleView,
    FeatureLifecycleProjectItem,
    NewStage,
} from './feature-lifecycle-store-type.js';
import type { Db } from '../../db/db.js';
import type { StageName } from '../../types/index.js';
import type EventEmitter from 'events';
import metricsHelper from '../../util/metrics-helper.js';
import { DB_TIME } from '../../metric-events.js';

type DBType = {
    stage: StageName;
    created_at: string;
    status: string | null;
    status_value: string | null;
};

type DBProjectType = DBType & {
    feature: string;
    project: string;
};

export class FeatureLifecycleStore implements IFeatureLifecycleStore {
    private db: Db;

    private timer: (string) => any;

    constructor(db: Db, eventBus: EventEmitter) {
        this.db = db;
        this.timer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'feature-lifecycle',
                action,
            });
    }

    async insert(
        featureLifecycleStages: FeatureLifecycleStage[],
    ): Promise<NewStage[]> {
        const stopTimer = this.timer('insert');
        const existingFeatures = await this.db('features')
            .select('name')
            .whereIn(
                'name',
                featureLifecycleStages.map((stage) => stage.feature),
            );
        const existingFeaturesSet = new Set(
            existingFeatures.map((item) => item.name),
        );
        const validStages = featureLifecycleStages.filter((stage) =>
            existingFeaturesSet.has(stage.feature),
        );

        if (validStages.length === 0) {
            stopTimer();
            return [];
        }
        const baseTime = new Date();
        const result = await this.db('feature_lifecycles')
            .insert(
                validStages.map((stage, index) => ({
                    feature: stage.feature,
                    stage: stage.stage,
                    status: stage.status,
                    status_value: stage.statusValue,
                    created_at: new Date(baseTime.getTime() + index), // prevent identical times for stages in bulk update
                })),
            )
            .returning('*')
            .onConflict(['feature', 'stage'])
            .ignore();

        stopTimer();
        return result.map((row) => ({
            stage: row.stage,
            feature: row.feature,
        }));
    }

    async get(feature: string): Promise<FeatureLifecycleView> {
        const stopTimer = this.timer('get');
        const results = await this.db('feature_lifecycles')
            .where({ feature })
            .orderBy('created_at', 'asc');
        stopTimer();

        return results.map(({ stage, status, created_at }: DBType) => ({
            stage,
            ...(status ? { status } : {}),
            enteredStageAt: new Date(created_at),
        }));
    }

    async getAll(): Promise<FeatureLifecycleProjectItem[]> {
        const stopTimer = this.timer('getAll');
        const results = await this.db('feature_lifecycles as flc')
            .select('flc.feature', 'flc.stage', 'flc.created_at', 'f.project')
            .leftJoin('features as f', 'f.name', 'flc.feature')
            .orderBy('created_at', 'asc');
        stopTimer();

        return results.map(
            ({ feature, stage, created_at, project }: DBProjectType) => ({
                feature,
                stage,
                project,
                enteredStageAt: new Date(created_at),
            }),
        );
    }

    async delete(feature: string): Promise<void> {
        const stopTimer = this.timer('delete');
        await this.db('feature_lifecycles').where({ feature }).del();
        stopTimer();
    }

    async deleteAll(): Promise<void> {
        const stopTimer = this.timer('deleteAll');
        await this.db('feature_lifecycles').del();
        stopTimer();
    }

    async deleteStage(stage: FeatureLifecycleStage): Promise<void> {
        const stopTimer = this.timer('deleteStage');
        await this.db('feature_lifecycles')
            .where({
                stage: stage.stage,
                feature: stage.feature,
            })
            .del();
        stopTimer();
    }

    async stageExists(stage: FeatureLifecycleStage): Promise<boolean> {
        const stopTimer = this.timer('stageExists');
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1 FROM feature_lifecycles WHERE stage = ? and feature = ?) AS present`,
            [stage.stage, stage.feature],
        );
        stopTimer();
        const { present } = result.rows[0];
        return present;
    }
}
