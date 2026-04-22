import type {
    ScheduledSequence,
    ScheduledSequenceStatus,
    ScheduledSequenceWriteModel,
} from '../../lib/features/release-agent/scheduled-sequence.js';
import type { IScheduledSequenceStore } from '../../lib/features/release-agent/scheduled-sequence-store.js';

export class FakeScheduledSequenceStore implements IScheduledSequenceStore {
    private items: ScheduledSequence[] = [];

    async insert(
        item: ScheduledSequenceWriteModel,
    ): Promise<ScheduledSequence> {
        const sequence: ScheduledSequence = {
            id: item.id,
            project: item.project,
            environment: item.environment,
            createdByUserId: item.createdByUserId,
            createdAt: new Date(),
            prompt: item.prompt ?? null,
            model: item.model ?? null,
            agentVersion: item.agentVersion ?? null,
            status: item.status ?? 'active',
        };
        this.items.push(sequence);
        return sequence;
    }

    async get(id: string): Promise<ScheduledSequence> {
        const match = this.items.find((s) => s.id === id);
        if (!match) throw new Error(`No sequence with id ${id}`);
        return match;
    }

    async getAll(): Promise<ScheduledSequence[]> {
        return [...this.items];
    }

    async update(
        id: string,
        item: Partial<ScheduledSequenceWriteModel>,
    ): Promise<ScheduledSequence> {
        const idx = this.items.findIndex((s) => s.id === id);
        if (idx < 0) throw new Error(`No sequence with id ${id}`);
        this.items[idx] = { ...this.items[idx], ...item } as ScheduledSequence;
        return this.items[idx];
    }

    async updateStatus(
        id: string,
        status: ScheduledSequenceStatus,
    ): Promise<ScheduledSequence> {
        return this.update(id, { status });
    }

    async delete(id: string): Promise<void> {
        this.items = this.items.filter((s) => s.id !== id);
    }

    async exists(id: string): Promise<boolean> {
        return this.items.some((s) => s.id === id);
    }

    async getByProjectAndEnvironment(
        project: string,
        environment: string,
    ): Promise<ScheduledSequence[]> {
        return this.items
            .filter(
                (s) => s.project === project && s.environment === environment,
            )
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
}
