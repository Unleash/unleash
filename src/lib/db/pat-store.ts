import type { Logger, LogProvider } from '../logger.js';
import type { IPatStore } from '../types/stores/pat-store.js';
import NotFoundError from '../error/notfound-error.js';
import type { Db } from './db.js';
import type { CreatePatSchema, PatSchema } from '../openapi/index.js';

const TABLE = 'personal_access_tokens';

const PAT_PUBLIC_COLUMNS = [
    'id',
    'description',
    'user_id',
    'expires_at',
    'created_at',
    'seen_at',
];

const rowToPat = ({
    id,
    description,
    expires_at,
    user_id,
    created_at,
    seen_at,
}): PatSchema => ({
    id,
    description,
    expiresAt: expires_at,
    userId: user_id,
    createdAt: created_at,
    seenAt: seen_at,
});

const patToRow = ({ description, expiresAt }: CreatePatSchema) => ({
    description,
    expires_at: expiresAt,
});

export default class PatStore implements IPatStore {
    private db: Db;

    private logger: Logger;

    constructor(db: Db, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('pat-store.ts');
    }

    async create(
        pat: CreatePatSchema,
        secret: string,
        userId: number,
    ): Promise<PatSchema> {
        const rows = await this.db(TABLE)
            .insert({ ...patToRow(pat), secret, user_id: userId })
            .returning('*');
        return rowToPat(rows[0]);
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

    async countByUser(userId: number): Promise<number> {
        const result = await this.db.raw(
            `SELECT COUNT(*) AS count FROM ${TABLE} WHERE user_id = ?`,
            [userId],
        );
        const { count } = result.rows[0];
        return count;
    }

    async get(id: number): Promise<PatSchema> {
        const row = await this.db(TABLE).where({ id }).first();
        if (!row) {
            throw new NotFoundError('No PAT found.');
        }
        return rowToPat(row);
    }

    async getAll(): Promise<PatSchema[]> {
        const pats = await this.db.select(PAT_PUBLIC_COLUMNS).from(TABLE);
        return pats.map(rowToPat);
    }

    async getAllByUser(userId: number): Promise<PatSchema[]> {
        const pats = await this.db
            .select(PAT_PUBLIC_COLUMNS)
            .from(TABLE)
            .where('user_id', userId);
        return pats.map(rowToPat);
    }
}
