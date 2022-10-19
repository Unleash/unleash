import { Knex } from 'knex';
import { Logger, LogProvider } from '../logger';
import { IPatStore } from '../types/stores/pat-store';
import Pat, { IPat } from '../types/models/pat';
import NotFoundError from '../error/notfound-error';

const TABLE = 'personal_access_tokens';

const PAT_PUBLIC_COLUMNS = [
    'id',
    'description',
    'user_id',
    'expires_at',
    'created_at',
    'seen_at',
];

const fromRow = (row) => {
    if (!row) {
        throw new NotFoundError('No PAT found');
    }
    return new Pat({
        id: row.id,
        secret: row.secret,
        userId: row.user_id,
        description: row.description,
        createdAt: row.created_at,
        seenAt: row.seen_at,
        expiresAt: row.expires_at,
    });
};

const toRow = (pat: IPat) => ({
    secret: pat.secret,
    description: pat.description,
    user_id: pat.userId,
    expires_at: pat.expiresAt,
});

export default class PatStore implements IPatStore {
    private db: Knex;

    private logger: Logger;

    constructor(db: Knex, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('pat-store.ts');
    }

    async create(token: IPat): Promise<IPat> {
        const row = await this.db(TABLE).insert(toRow(token)).returning('*');
        return fromRow(row[0]);
    }

    async delete(id: number): Promise<void> {
        return this.db(TABLE).where({ id: id }).del();
    }

    async deleteForUser(id: number, userId: number): Promise<void> {
        return this.db(TABLE).where({ id: id, user_id: userId }).del();
    }

    async deleteAll(): Promise<void> {
        await this.db(TABLE).del();
    }

    destroy(): void {}

    async exists(id: number): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1 FROM ${TABLE} WHERE id = ?) AS present`,
            [id],
        );
        const { present } = result.rows[0];
        return present;
    }

    async existsWithDescriptionByUser(
        description: string,
        userId: number,
    ): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1 FROM ${TABLE} WHERE description = ? AND user_id = ?) AS present`,
            [description, userId],
        );
        const { present } = result.rows[0];
        return present;
    }

    async get(id: number): Promise<Pat> {
        const row = await this.db(TABLE).where({ id }).first();
        return fromRow(row);
    }

    async getAll(): Promise<Pat[]> {
        const groups = await this.db.select(PAT_PUBLIC_COLUMNS).from(TABLE);
        return groups.map(fromRow);
    }

    async getAllByUser(userId: number): Promise<Pat[]> {
        const groups = await this.db
            .select(PAT_PUBLIC_COLUMNS)
            .from(TABLE)
            .where('user_id', userId);
        return groups.map(fromRow);
    }
}
