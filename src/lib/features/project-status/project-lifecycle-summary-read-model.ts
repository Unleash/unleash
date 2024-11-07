import type { StageName } from '../../types';
import * as permissions from '../../types/permissions';
import type { Db } from '../../db/db';

const { ADMIN } = permissions;

export type IProjectLifecycleSummaryReadModel = {};

type ProjectLifecycleSummary = {
    initial: {
        averageDays: number;
        currentFlags: number;
    };
    preLive: {
        averageDays: number;
        currentFlags: number;
    };
    live: {
        averageDays: number;
        currentFlags: number;
    };
    completed: {
        averageDays: number;
        currentFlags: number;
    };
    archived: {
        currentFlags: number;
        archivedFlagsOverLastMonth: number;
    };
};

const stages: StageName[] = ['initial', 'pre-live', 'live', 'completed'];

export class ProjectLifecycleSummaryReadModel
    implements IProjectLifecycleSummaryReadModel
{
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async getAverageTimeInEachStage(projectId: string): Promise<{
        initial: number;
        'pre-live': number;
        live: number;
        completed: number;
    }> {
        const q = this.db
            .with(
                'stage_durations',
                this.db('feature_lifecycles as fl1')
                    .select('fl1.feature', 'fl1.stage')
                    .min(
                        this.db.raw(
                            'EXTRACT(EPOCH FROM (fl2.created_at - fl1.created_at)) / 86400',
                        ),
                    )
                    .as('days_in_stage')
                    .join('feature_lifecycles as fl2', function () {
                        this.on('fl1.feature', '=', 'fl2.feature').andOn(
                            'fl2.created_at',
                            '>',
                            'fl1.created_at',
                        ); // Join with the next row based on created_at
                    })
                    .innerJoin('features as f', 'fl1.feature', 'f.id')
                    .where('f.project', projectId)
                    .whereNot('fl1.stage', 'archived') // Exclude 'archived' stage
                    .groupBy('fl1.feature', 'fl1.stage', 'fl1.created_at'),
            )
            .select('stage_durations.stage')
            .avg(this.db.raw('ROUND(days_in_stage) as avg_days_in_stage'))
            .from('stage_durations')
            .groupBy('stage_durations.stage')
            .orderByRaw(
                `array_position(array[${stages.map((stage) => `'${stage}'`).join(',')}], stage_durations.stage)`,
            );

        const result = await q;
        console.log(result);

        return q.then((rows) => {
            const result = {
                initial: 0,
                'pre-live': 0,
                live: 0,
                completed: 0,
            };
            rows.forEach((row) => {
                result[row.stage] = row.avg_days_in_stage;
            });
            return result;
        });
    }

    async getCurrentFlagsInEachStage(projectId: string) {
        return 0;
    }

    async getArchivedFlagsOverLastMonth(projectId: string) {
        return 0;
    }

    async getProjectLifecycleSummary(
        projectId: string,
    ): Promise<ProjectLifecycleSummary> {
        const [
            averageTimeInEachStage,
            currentFlagsInEachStage,
            archivedFlagsOverLastMonth,
        ] = await Promise.all([
            this.getAverageTimeInEachStage(projectId),
            this.getCurrentFlagsInEachStage(projectId),
            this.getArchivedFlagsOverLastMonth(projectId),
        ]);

        // collate the data
        return;
    }
}
