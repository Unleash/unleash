import { CRUDStore, type CrudStoreConfig } from '../../db/crud/crud-store.js';
import {
    defaultFromRow,
    defaultToRow,
} from '../../db/crud/default-mappings.js';
import type { Db } from '../../db/db.js';
import type {
    ScheduledSequence,
    ScheduledSequenceStatus,
    ScheduledSequenceWriteModel,
} from './scheduled-sequence.js';

const TABLE = 'scheduled_sequences';

type ScheduledSequenceRow = {
    id: string;
    project: string;
    environment: string;
    created_by_user_id: number | null;
    created_at: Date;
    prompt: string | null;
    model: string | null;
    agent_version: string | null;
    status: ScheduledSequenceStatus;
};

export interface IScheduledSequenceStore {
    insert(item: ScheduledSequenceWriteModel): Promise<ScheduledSequence>;
    get(id: string): Promise<ScheduledSequence>;
    getAll(): Promise<ScheduledSequence[]>;
    update(
        id: string,
        item: Partial<ScheduledSequenceWriteModel>,
    ): Promise<ScheduledSequence>;
    updateStatus(
        id: string,
        status: ScheduledSequenceStatus,
    ): Promise<ScheduledSequence>;
    delete(id: string): Promise<void>;
    exists(id: string): Promise<boolean>;
    getByProjectAndEnvironment(
        project: string,
        environment: string,
    ): Promise<ScheduledSequence[]>;
}

export class ScheduledSequenceStore
    extends CRUDStore<
        ScheduledSequence,
        ScheduledSequenceWriteModel,
        ScheduledSequenceRow,
        ScheduledSequenceRow,
        string
    >
    implements IScheduledSequenceStore
{
    constructor(db: Db, config: CrudStoreConfig) {
        super(TABLE, db, config, {
            fromRow: (row) =>
                defaultFromRow<ScheduledSequence, ScheduledSequenceRow>(row),
            toRow: (item) =>
                defaultToRow<ScheduledSequenceWriteModel, ScheduledSequenceRow>(
                    item,
                ),
        });
    }

    async updateStatus(
        id: string,
        status: ScheduledSequenceStatus,
    ): Promise<ScheduledSequence> {
        return this.update(id, { status });
    }

    async getByProjectAndEnvironment(
        project: string,
        environment: string,
    ): Promise<ScheduledSequence[]> {
        const endTimer = this.timer('getByProjectAndEnvironment');
        const rows: ScheduledSequenceRow[] = await this.db(TABLE)
            .where({ project, environment })
            .orderBy('created_at', 'desc');
        endTimer();
        return rows.map((row) => this.fromRow(row) as ScheduledSequence);
    }
}
