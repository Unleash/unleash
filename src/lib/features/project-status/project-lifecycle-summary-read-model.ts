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
                    .select(
                        'fl1.feature',
                        'fl1.stage',
                        this.db.raw(
                            'EXTRACT(EPOCH FROM (MIN(fl2.created_at) - fl1.created_at)) / 86400 AS days_in_stage',
                        ),
                    )
                    .join('feature_lifecycles as fl2', function () {
                        this.on('fl1.feature', '=', 'fl2.feature').andOn(
                            'fl2.created_at',
                            '>',
                            'fl1.created_at',
                        );
                    })
                    .innerJoin('features as f', 'fl1.feature', 'f.name') // Join with features table to filter by project
                    .where('f.project', projectId) // Filter for the specific project
                    .whereNot('fl1.stage', 'archived') // Exclude 'archived' stage
                    .groupBy('fl1.feature', 'fl1.stage', 'fl1.created_at'),
            )
            .select('stage_durations.stage')
            .select(
                this.db.raw('ROUND(AVG(days_in_stage)) AS avg_days_in_stage'),
            )
            .from('stage_durations')
            .groupBy('stage_durations.stage')
            .orderByRaw(
                `array_position(array[${stages.map((stage) => `'${stage}'`).join(',')}], stage_durations.stage)`,
            );

        // Execute the query and map results to the output structure
        const result = await q;
        return result.reduce(
            (acc, row) => {
                acc[row.stage] = Number(row.avg_days_in_stage);
                return acc;
            },
            {
                initial: 0,
                'pre-live': 0,
                live: 0,
                completed: 0,
            },
        );
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
