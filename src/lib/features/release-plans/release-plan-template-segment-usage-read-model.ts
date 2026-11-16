import type { Db } from '../../db/db.js';
import type { IReleasePlanTemplateSegmentUsageReadModel } from './release-plan-template-segment-usage-read-model-type.js';

export class ReleasePlanTemplateSegmentUsageReadModel
    implements IReleasePlanTemplateSegmentUsageReadModel
{
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    async isSegmentUsedInActiveTemplates(segmentId: number): Promise<boolean> {
        const row = await this.db('milestone_strategy_segments AS mss')
            .join(
                'milestone_strategies AS ms',
                'ms.id',
                'mss.milestone_strategy_id',
            )
            .join('milestones AS mi', 'mi.id', 'ms.milestone_id')
            .join(
                'release_plan_definitions AS rpd',
                'rpd.id',
                'mi.release_plan_definition_id',
            )
            .where('mss.segment_id', segmentId)
            .where('rpd.discriminator', 'template')
            .whereNull('rpd.archived_at')
            .first('mss.segment_id');

        return Boolean(row);
    }
}
