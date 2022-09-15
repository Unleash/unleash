import { Knex } from 'knex';
import { Logger, LogProvider } from '../logger';
import { IPatStore } from '../types/stores/pat-store';
import Pat, { IPat } from '../types/models/pat';
import NotFoundError from '../error/notfound-error';

const TABLE = 'personal_access_tokens';

const PAT_COLUMNS = [
    'secret',
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
        secret: row.secret,
        userId: row.user_id,
        createdAt: row.created_at,
        seenAt: row.seen_at,
        expiresAt: row.expires_at,
    });
};

const toRow = (user: IPat) => ({
    secret: user.secret,
    user_id: user.userId,
    expires_at: user.expiresAt,
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

    async delete(secret: string): Promise<void> {
        return this.db(TABLE).where({ secret: secret }).del();
    }

    async deleteAll(): Promise<void> {
        await this.db(TABLE).del();
    }

    destroy(): void {}

    async exists(secret: string): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS(SELECT 1 FROM ${TABLE} WHERE secret = ?) AS present`,
            [secret],
        );
        const { present } = result.rows[0];
        return present;
    }

    async get(secret: string): Promise<Pat> {
        const row = await this.db(TABLE).where({ secret }).first();
        return fromRow(row);
    }

    async getAll(): Promise<Pat[]> {
        const groups = await this.db.select(PAT_COLUMNS).from(TABLE);
        return groups.map(fromRow);
    }

    async getAllByUser(userId: number): Promise<Pat[]> {
        const groups = await this.db
            .select(PAT_COLUMNS)
            .from(TABLE)
            .where('user_id', userId);
        return groups.map(fromRow);
    }
}
