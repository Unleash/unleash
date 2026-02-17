import { ulid } from 'ulidx';
import type { ReleasePlanMilestoneStrategy } from './release-plan-milestone-strategy.js';
import { CRUDStore, type CrudStoreConfig } from '../../db/crud/crud-store.js';
import type { Row } from '../../db/crud/row-type.js';
import type { Db } from '../../db/db.js';
import type { MilestoneStrategyConfig } from '../../types/index.js';
import type { Store } from '../../types/stores/store.js';
const TABLE = 'milestone_strategies';

export type ReleasePlanMilestoneStrategyWriteModel = Omit<
    ReleasePlanMilestoneStrategy,
    'id'
>;
export interface IReleasePlanMilestoneStrategyStore
    extends Store<ReleasePlanMilestoneStrategy, string> {
    insert(
        item: ReleasePlanMilestoneStrategyWriteModel,
    ): Promise<ReleasePlanMilestoneStrategy>;
    upsert(
        id: string,
        updates: MilestoneStrategyConfig,
    ): Promise<ReleasePlanMilestoneStrategy>;
    deleteStrategiesForMilestone(milestoneId: string): Promise<void>;
}

const fromRow = (row: any): ReleasePlanMilestoneStrategy => {
    return {
        id: row.id,
        milestoneId: row.milestone_id,
        sortOrder: row.sort_order,
        title: row.title,
        strategyName: row.strategy_name,
        parameters: row.parameters,
        constraints: JSON.parse(row.constraints),
        variants: JSON.parse(row.variants),
        segments: [],
    };
};

const toRow = (item: ReleasePlanMilestoneStrategyWriteModel) => {
    return {
        id: ulid(),
        milestone_id: item.milestoneId,
        sort_order: item.sortOrder,
        title: item.title,
        strategy_name: item.strategyName,
        parameters: item.parameters ?? {},
        constraints: JSON.stringify(item.constraints ?? []),
        variants: JSON.stringify(item.variants ?? []),
    };
};

const toUpdateRow = (item: MilestoneStrategyConfig) => {
    return {
        milestone_id: item.milestoneId,
        sort_order: item.sortOrder,
        title: item.title,
        strategy_name: item.strategyName,
        parameters: item.parameters ?? {},
        constraints: JSON.stringify(item.constraints ?? []),
        variants: JSON.stringify(item.variants ?? []),
    };
};

export class ReleasePlanMilestoneStrategyStore
    extends CRUDStore<
        ReleasePlanMilestoneStrategy,
        ReleasePlanMilestoneStrategyWriteModel,
        Row<ReleasePlanMilestoneStrategy>,
        ReleasePlanMilestoneStrategy,
        string
    >
    implements IReleasePlanMilestoneStrategyStore
{
    constructor(db: Db, config: CrudStoreConfig) {
        super(TABLE, db, config);
    }

    override async insert({
        segments,
        ...strategy
    }: ReleasePlanMilestoneStrategyWriteModel): Promise<ReleasePlanMilestoneStrategy> {
        const row = toRow(strategy);
        await this.db(TABLE).insert(row);
        segments?.forEach(async (segmentId) => {
            const segmentRow = {
                milestone_strategy_id: row.id,
                segment_id: segmentId,
            };
            await this.db('milestone_strategy_segments').insert(segmentRow);
        });
        return fromRow(row);
    }

    private async updateStrategy(
        strategyId: string,
        { segments, ...strategy }: MilestoneStrategyConfig,
    ): Promise<ReleasePlanMilestoneStrategy> {
        const rows = await this.db(this.tableName)
            .where({ id: strategyId })
            .update(toUpdateRow(strategy))
            .returning('*');
        return this.fromRow(rows[0]) as ReleasePlanMilestoneStrategy;
    }

    async upsert(
        strategyId: string,
        { segments, ...strategy }: MilestoneStrategyConfig,
    ): Promise<ReleasePlanMilestoneStrategy> {
        const releasePlanMilestoneStrategy = await this.updateStrategy(
            strategyId,
            strategy,
        );
        // now delete
        await this.db('milestone_strategy_segments')
            .where('milestone_strategy_id', strategyId)
            .delete();
        for (const segmentId of segments ?? []) {
            const segmentRow = {
                milestone_strategy_id: strategyId,
                segment_id: segmentId,
            };
            await this.db('milestone_strategy_segments').insert(segmentRow);
        }
        return releasePlanMilestoneStrategy;
    }

    async deleteStrategiesForMilestone(milestoneId: string): Promise<void> {
        await this.db('milestone_strategies')
            .where('milestone_id', milestoneId)
            .delete();
    }
}
