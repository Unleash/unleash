import { ulid } from 'ulidx';
import type { ReleasePlanMilestoneStrategy } from './release-plan-milestone-strategy.js';
import { CRUDStore, type CrudStoreConfig } from '../../db/crud/crud-store.js';
import type { Row } from '../../db/crud/row-type.js';
import type { Db } from '../../db/db.js';
import type { MilestoneStrategyConfigUpdate } from '../../types/index.js';
import type { Store } from '../../types/stores/store.js';
import NotFoundError from '../../error/notfound-error.js';

const TABLE = 'milestone_strategies';

export type ReleasePlanMilestoneStrategyWriteModel = Omit<
    ReleasePlanMilestoneStrategy,
    'id' | 'name'
> & { strategyName: string };

export interface IReleasePlanMilestoneStrategyStore
    extends Store<ReleasePlanMilestoneStrategy, string> {
    insert(
        item: ReleasePlanMilestoneStrategyWriteModel,
    ): Promise<ReleasePlanMilestoneStrategy>;
    update(
        id: string,
        item: Partial<ReleasePlanMilestoneStrategyWriteModel>,
    ): Promise<ReleasePlanMilestoneStrategy>;
    upsert(
        id: string,
        updates: Partial<MilestoneStrategyConfigUpdate>,
    ): Promise<ReleasePlanMilestoneStrategy>;
    deleteStrategiesForMilestone(milestoneId: string): Promise<void>;
}

const fromRow = (row: any): ReleasePlanMilestoneStrategy => {
    return {
        id: row.id,
        milestoneId: row.milestone_id,
        sortOrder: row.sort_order,
        title: row.title,
        name: row.strategy_name,
        strategyName: row.strategy_name,
        parameters: row.parameters,
        constraints: JSON.parse(row.constraints),
        variants: JSON.parse(row.variants),
        segments: [],
        disabled: row.disabled,
    };
};

const fromDatabaseRow = (row: any): ReleasePlanMilestoneStrategy => {
    return {
        id: row.id,
        milestoneId: row.milestone_id,
        sortOrder: row.sort_order,
        title: row.title,
        name: row.strategy_name,
        strategyName: row.strategy_name,
        parameters: row.parameters,
        constraints: row.constraints,
        variants: row.variants,
        disabled: row.disabled,
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
        disabled: item.disabled ?? false,
    };
};

const toUpdateRow = (item: Partial<MilestoneStrategyConfigUpdate>) => {
    return {
        sort_order: item.sortOrder,
        title: item.title,
        parameters: item.parameters ?? {},
        constraints: JSON.stringify(item.constraints ?? []),
        variants: JSON.stringify(item.variants ?? []),
        disabled: item.disabled ?? false,
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

    override async get(id: string): Promise<ReleasePlanMilestoneStrategy> {
        const row = await this.db(TABLE).where({ id }).first();
        if (!row) {
            throw new NotFoundError(
                `Milestone strategy with id ${id} not found`,
            );
        }
        const strategy = fromDatabaseRow(row);

        const segmentRows = await this.db('milestone_strategy_segments')
            .where('milestone_strategy_id', id)
            .select('segment_id');

        return {
            ...strategy,
            segments: segmentRows.map((row: any) => row.segment_id),
        };
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
        { segments, ...strategy }: Partial<MilestoneStrategyConfigUpdate>,
    ): Promise<ReleasePlanMilestoneStrategy> {
        const rows = await this.db(this.tableName)
            .where({ id: strategyId })
            .update(toUpdateRow(strategy))
            .returning('*');
        return fromDatabaseRow(rows[0]);
    }

    async upsert(
        strategyId: string,
        { segments, ...strategy }: Partial<MilestoneStrategyConfigUpdate>,
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
        return { ...releasePlanMilestoneStrategy, segments: segments ?? [] };
    }

    async deleteStrategiesForMilestone(milestoneId: string): Promise<void> {
        await this.db('milestone_strategies')
            .where('milestone_id', milestoneId)
            .delete();
    }
}
