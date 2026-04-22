import { CRUDStore, type CrudStoreConfig } from '../../db/crud/crud-store.js';
import type { Db } from '../../db/db.js';
import type {
    ScheduledAction,
    ScheduledActionStatus,
    ScheduledActionWriteModel,
} from './scheduled-action.js';

const TABLE = 'scheduled_actions';

type ScheduledActionRow = {
    id: string;
    sequence_id: string;
    feature_name: string;
    fire_at: Date;
    action_type: ScheduledAction['actionType'];
    payload: unknown;
    owned_strategy_id: string | null;
    status: ScheduledActionStatus;
    executed_at: Date | null;
    error: string | null;
    sort_order: number;
};

const fromRow = (row: ScheduledActionRow): ScheduledAction =>
    ({
        id: row.id,
        sequenceId: row.sequence_id,
        featureName: row.feature_name,
        fireAt: row.fire_at,
        actionType: row.action_type,
        payload: row.payload,
        ownedStrategyId: row.owned_strategy_id,
        status: row.status,
        executedAt: row.executed_at,
        error: row.error,
        sortOrder: row.sort_order,
    }) as ScheduledAction;

const toRow = (
    item: Partial<ScheduledActionWriteModel>,
): Partial<ScheduledActionRow> => ({
    id: item.id,
    sequence_id: item.sequenceId,
    feature_name: item.featureName,
    fire_at: item.fireAt,
    action_type: item.actionType,
    payload: item.payload as unknown,
    owned_strategy_id: item.ownedStrategyId ?? null,
    status: item.status,
    executed_at: item.executedAt ?? null,
    error: item.error ?? null,
    sort_order: item.sortOrder,
});

export interface IScheduledActionStore {
    insert(item: ScheduledActionWriteModel): Promise<ScheduledAction>;
    bulkInsert(items: ScheduledActionWriteModel[]): Promise<ScheduledAction[]>;
    get(id: string): Promise<ScheduledAction>;
    getAll(): Promise<ScheduledAction[]>;
    delete(id: string): Promise<void>;
    exists(id: string): Promise<boolean>;
    getBySequenceId(sequenceId: string): Promise<ScheduledAction[]>;
    getActionsToFire(now: Date, limit?: number): Promise<ScheduledAction[]>;
    markExecuted(
        id: string,
        ownedStrategyId: string | null,
    ): Promise<ScheduledAction>;
    markFailed(id: string, error: string): Promise<ScheduledAction>;
    markSkipped(id: string, reason: string): Promise<ScheduledAction>;
    cancelPendingForSequence(sequenceId: string): Promise<number>;
}

export class ScheduledActionStore
    extends CRUDStore<
        ScheduledAction,
        ScheduledActionWriteModel,
        ScheduledActionRow,
        ScheduledActionRow,
        string
    >
    implements IScheduledActionStore
{
    constructor(db: Db, config: CrudStoreConfig) {
        super(TABLE, db, config, {
            fromRow: (row) => fromRow(row as ScheduledActionRow),
            toRow,
        });
    }

    async getBySequenceId(sequenceId: string): Promise<ScheduledAction[]> {
        const endTimer = this.timer('getBySequenceId');
        const rows: ScheduledActionRow[] = await this.db(TABLE)
            .where({ sequence_id: sequenceId })
            .orderBy('sort_order', 'asc');
        endTimer();
        return rows.map(fromRow);
    }

    async getActionsToFire(now: Date, limit = 100): Promise<ScheduledAction[]> {
        const endTimer = this.timer('getActionsToFire');
        const rows: ScheduledActionRow[] = await this.db(TABLE)
            .where('status', 'pending')
            .andWhere('fire_at', '<=', now)
            .orderBy('fire_at', 'asc')
            .orderBy('sort_order', 'asc')
            .limit(limit);
        endTimer();
        return rows.map(fromRow);
    }

    async markExecuted(
        id: string,
        ownedStrategyId: string | null,
    ): Promise<ScheduledAction> {
        const endTimer = this.timer('markExecuted');
        const [row] = await this.db(TABLE)
            .where({ id })
            .update({
                status: 'executed',
                executed_at: new Date(),
                owned_strategy_id: ownedStrategyId,
                error: null,
            })
            .returning('*');
        endTimer();
        return fromRow(row);
    }

    async markFailed(id: string, error: string): Promise<ScheduledAction> {
        const endTimer = this.timer('markFailed');
        const [row] = await this.db(TABLE)
            .where({ id })
            .update({
                status: 'failed',
                executed_at: new Date(),
                error,
            })
            .returning('*');
        endTimer();
        return fromRow(row);
    }

    async markSkipped(id: string, reason: string): Promise<ScheduledAction> {
        const endTimer = this.timer('markSkipped');
        const [row] = await this.db(TABLE)
            .where({ id })
            .update({
                status: 'skipped',
                executed_at: new Date(),
                error: reason,
            })
            .returning('*');
        endTimer();
        return fromRow(row);
    }

    async cancelPendingForSequence(sequenceId: string): Promise<number> {
        const endTimer = this.timer('cancelPendingForSequence');
        const count = await this.db(TABLE)
            .where({ sequence_id: sequenceId, status: 'pending' })
            .update({
                status: 'skipped',
                executed_at: new Date(),
                error: 'Sequence cancelled',
            });
        endTimer();
        return Number(count);
    }
}
