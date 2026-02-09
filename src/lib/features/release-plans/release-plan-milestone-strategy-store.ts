import type { Knex } from 'knex';
import { ulid } from 'ulidx';
import type { ReleasePlanMilestoneStrategy } from './release-plan-milestone-strategy.js';
import { CRUDStore, type CrudStoreConfig } from '../../db/crud/crud-store.js';
import type { Row } from '../../db/crud/row-type.js';
import type { Db } from '../../db/db.js';

const TABLE = 'milestone_strategies';

export type ReleasePlanMilestoneStrategyWriteModel = Omit<
    ReleasePlanMilestoneStrategy,
    'id'
>;

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

const toUpdateRow = (item: ReleasePlanMilestoneStrategyWriteModel) => {
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

export class ReleasePlanMilestoneStrategyStore extends CRUDStore<
    ReleasePlanMilestoneStrategy,
    ReleasePlanMilestoneStrategyWriteModel,
    Row<ReleasePlanMilestoneStrategy>,
    ReleasePlanMilestoneStrategy,
    string
> {
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
        { segments, ...strategy }: ReleasePlanMilestoneStrategyWriteModel,
    ): Promise<ReleasePlanMilestoneStrategy> {
        const rows = await this.db(this.tableName)
            .where({ id: strategyId })
            .update(toUpdateRow(strategy))
            .returning('*');
        return this.fromRow(rows[0]) as ReleasePlanMilestoneStrategy;
    }

    async upsert(
        strategyId: string,
        { segments, ...strategy }: ReleasePlanMilestoneStrategyWriteModel,
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

    /**
     * Update strategy fields and segments.
     * If trx is provided, uses that transaction; otherwise creates a new one.
     */
    async updateWithSegments(
        strategyId: string,
        data: {
            strategyName?: string;
            parameters?: Record<string, string>;
            constraints?: unknown[];
            variants?: unknown[];
            title?: string | null;
        },
        segmentIds: number[],
        trx?: Knex,
    ): Promise<void> {
        const doUpdate = async (db: Knex) => {
            // Update strategy fields
            const updateData: Record<string, unknown> = {};

            if (data.strategyName !== undefined) {
                updateData.strategy_name = data.strategyName;
            }
            if (data.parameters !== undefined) {
                updateData.parameters = data.parameters;
            }
            if (data.constraints !== undefined) {
                updateData.constraints = JSON.stringify(data.constraints);
            }
            if (data.variants !== undefined) {
                updateData.variants = JSON.stringify(data.variants);
            }
            if (data.title !== undefined) {
                updateData.title = data.title;
            }

            if (Object.keys(updateData).length > 0) {
                await db(this.tableName)
                    .where({ id: strategyId })
                    .update(updateData);
            }

            // Update segments
            await db('milestone_strategy_segments')
                .where('milestone_strategy_id', strategyId)
                .delete();

            if (segmentIds.length > 0) {
                const rows = segmentIds.map((segmentId) => ({
                    milestone_strategy_id: strategyId,
                    segment_id: segmentId,
                }));
                await db('milestone_strategy_segments').insert(rows);
            }
        };

        if (trx) {
            await doUpdate(trx);
        } else {
            await this.db.transaction(async (newTrx) => doUpdate(newTrx));
        }
    }
}
