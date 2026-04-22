import type {
    ScheduledAction,
    ScheduledActionWriteModel,
} from '../../lib/features/release-agent/scheduled-action.js';
import type { IScheduledActionStore } from '../../lib/features/release-agent/scheduled-action-store.js';

const toStored = (item: ScheduledActionWriteModel): ScheduledAction =>
    ({
        id: item.id,
        sequenceId: item.sequenceId,
        featureName: item.featureName,
        fireAt: item.fireAt,
        actionType: item.actionType,
        payload: item.payload,
        ownedStrategyId: item.ownedStrategyId ?? null,
        status: item.status ?? 'pending',
        executedAt: item.executedAt ?? null,
        error: item.error ?? null,
        sortOrder: item.sortOrder,
    }) as ScheduledAction;

export class FakeScheduledActionStore implements IScheduledActionStore {
    private items: ScheduledAction[] = [];

    async insert(item: ScheduledActionWriteModel): Promise<ScheduledAction> {
        const stored = toStored(item);
        this.items.push(stored);
        return stored;
    }

    async bulkInsert(
        items: ScheduledActionWriteModel[],
    ): Promise<ScheduledAction[]> {
        return Promise.all(items.map((item) => this.insert(item)));
    }

    async get(id: string): Promise<ScheduledAction> {
        const match = this.items.find((a) => a.id === id);
        if (!match) throw new Error(`No action with id ${id}`);
        return match;
    }

    async getAll(): Promise<ScheduledAction[]> {
        return [...this.items];
    }

    async delete(id: string): Promise<void> {
        this.items = this.items.filter((a) => a.id !== id);
    }

    async exists(id: string): Promise<boolean> {
        return this.items.some((a) => a.id === id);
    }

    async getBySequenceId(sequenceId: string): Promise<ScheduledAction[]> {
        return this.items
            .filter((a) => a.sequenceId === sequenceId)
            .sort((a, b) => a.sortOrder - b.sortOrder);
    }

    async getActionsToFire(now: Date, limit = 100): Promise<ScheduledAction[]> {
        return this.items
            .filter(
                (a) =>
                    a.status === 'pending' &&
                    a.fireAt.getTime() <= now.getTime(),
            )
            .sort((a, b) => {
                const byTime = a.fireAt.getTime() - b.fireAt.getTime();
                return byTime !== 0 ? byTime : a.sortOrder - b.sortOrder;
            })
            .slice(0, limit);
    }

    async markExecuted(
        id: string,
        ownedStrategyId: string | null,
    ): Promise<ScheduledAction> {
        const idx = this.items.findIndex((a) => a.id === id);
        if (idx < 0) throw new Error(`No action with id ${id}`);
        this.items[idx] = {
            ...this.items[idx],
            status: 'executed',
            executedAt: new Date(),
            ownedStrategyId,
            error: null,
        };
        return this.items[idx];
    }

    async markFailed(id: string, error: string): Promise<ScheduledAction> {
        const idx = this.items.findIndex((a) => a.id === id);
        if (idx < 0) throw new Error(`No action with id ${id}`);
        this.items[idx] = {
            ...this.items[idx],
            status: 'failed',
            executedAt: new Date(),
            error,
        };
        return this.items[idx];
    }

    async markSkipped(id: string, reason: string): Promise<ScheduledAction> {
        const idx = this.items.findIndex((a) => a.id === id);
        if (idx < 0) throw new Error(`No action with id ${id}`);
        this.items[idx] = {
            ...this.items[idx],
            status: 'skipped',
            executedAt: new Date(),
            error: reason,
        };
        return this.items[idx];
    }

    async cancelPendingForSequence(sequenceId: string): Promise<number> {
        let count = 0;
        this.items = this.items.map((a) => {
            if (a.sequenceId === sequenceId && a.status === 'pending') {
                count++;
                return {
                    ...a,
                    status: 'skipped' as const,
                    executedAt: new Date(),
                    error: 'Sequence cancelled',
                };
            }
            return a;
        });
        return count;
    }
}
