import { ISuggestChangeStore } from '../types/stores/suggest-change-store';
import { Logger, LogProvider } from '../logger';
import EventEmitter from 'events';
import { Knex } from 'knex';
import { PartialSome } from '../types/partial';
import { ISuggestChange, ISuggestChangeSet } from '../types/model';
import User from '../types/user';
import NotFoundError from '../error/notfound-error';

const Tables = {
    suggestChangeSet: 'suggest_change_set',
};

const COLUMNS = [
    'id',
    'environment',
    'state',
    'project',
    'changes',
    'created_by',
    'created_at',
    'updated_by',
];

interface ISuggestChangeSetRow {
    id: number;
    environment: string;
    state?: string;
    project?: string;
    created_by?: string;
    created_at?: Date;
    changes?: ISuggestChange[];
}

export default class SuggestChangeStore implements ISuggestChangeStore {
    private logger: Logger;

    private eventBus: EventEmitter;

    private db: Knex;

    constructor(db: Knex, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.eventBus = eventBus;
        this.logger = getLogger('lib/db/suggest-change-store.ts');
    }

    async create(
        suggestChangeSet: PartialSome<ISuggestChangeSet, 'id'>,
        user: Partial<Pick<User, 'username' | 'email'>>,
    ): Promise<ISuggestChangeSet> {
        const rows = await this.db(Tables.suggestChangeSet)
            .insert<ISuggestChangeSetRow>({
                id: suggestChangeSet.id,
                environment: suggestChangeSet.environment,
                state: suggestChangeSet.state,
                project: suggestChangeSet.project,
                changes: JSON.stringify(suggestChangeSet.changes),
                created_at: suggestChangeSet.createdAt,
                created_by: user.username || user.email,
            })
            .returning(COLUMNS);

        return this.mapRow(rows[0]);
    }

    async getAll(): Promise<ISuggestChangeSet[]> {
        const rows: ISuggestChangeSet[] = await this.db
            .select(this.prefixColumns())
            .from(Tables.suggestChangeSet)
            .orderBy('id', 'asc');

        return rows.map(this.mapRow);
    }

    async get(id: number): Promise<ISuggestChangeSet> {
        const rows: ISuggestChangeSetRow[] = await this.db
            .select(this.prefixColumns())
            .from(Tables.suggestChangeSet)
            .where({ id });

        return this.mapRow(rows[0]);
    }

    prefixColumns(): string[] {
        return COLUMNS.map((c) => `${Tables.suggestChangeSet}.${c}`);
    }

    mapRow(row?: ISuggestChangeSetRow): ISuggestChangeSet {
        if (!row) {
            throw new NotFoundError('No row');
        }

        return {
            id: row.id,
            environment: row.environment,
            state: row.state,
            project: row.project,
            changes: row.changes,
            createdBy: row.created_by,
            createdAt: row.created_at,
        };
    }

    delete(id: number): Promise<void> {
        return this.db(Tables.suggestChangeSet).where({ id }).del();
    }

    deleteAll(): Promise<void> {
        return this.db(Tables.suggestChangeSet).del();
    }

    async exists(id: number): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1 FROM ${Tables.suggestChangeSet} WHERE id = ?) AS present`,
            [id],
        );

        return result.rows[0].present;
    }

    destroy(): void {}
}
