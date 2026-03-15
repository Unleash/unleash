import type EventEmitter from 'events';
import type { Logger, LogProvider } from '../logger.js';
import NotFoundError from '../error/notfound-error.js';
import type {
    ISession,
    ISessionStore,
    ISessionWithUserInfo,
} from '../types/stores/session-store.js';
import { addDays } from 'date-fns';
import type { Db } from './db.js';

const TABLE = 'unleash_session';

interface ISessionRow {
    id: string;
    sid: string;
    sess: string;
    created_at: Date;
    expired?: Date;
}

export default class SessionStore implements ISessionStore {
    private logger: Logger;

    private eventBus: EventEmitter;

    private db: Db;

    constructor(db: Db, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.eventBus = eventBus;
        this.logger = getLogger('lib/db/session-store.ts');
    }

    async getActiveSessions(): Promise<ISession[]> {
        const rows = await this.db<ISessionRow>(TABLE)
            .whereNull('expired')
            .orWhere('expired', '>', new Date())
            .orderBy('created_at', 'desc');
        return rows.map(this.rowToSession);
    }

    async getActiveSessionsWithUserInfo(): Promise<ISessionWithUserInfo[]> {
        const rows = await this.db(TABLE)
            .leftJoin(
                'users',
                this.db.raw(`(${TABLE}.sess->'user'->>'id')::int = users.id`),
            )
            .select(
                `${TABLE}.id`,
                `${TABLE}.sid`,
                `${TABLE}.sess`,
                `${TABLE}.created_at`,
                `${TABLE}.expired`,
                'users.image_url',
                'users.seen_at',
            )
            .whereNull(`${TABLE}.expired`)
            .orWhere(`${TABLE}.expired`, '>', new Date())
            .orderBy(`${TABLE}.created_at`, 'desc');
        return rows.map((row) => ({
            ...this.rowToSession(row),
            imageUrl: row.image_url ?? null,
            seenAt: row.seen_at ?? null,
        }));
    }

    async getSessionsForUser(userId: number): Promise<ISession[]> {
        const rows = await this.db<ISessionRow>(TABLE).whereRaw(
            "(sess -> 'user' ->> 'id')::int = ?",
            [userId],
        );
        if (rows && rows.length > 0) {
            return rows.map(this.rowToSession);
        }
        return [];
    }

    async get(sid: string): Promise<ISession> {
        const row = await this.db<ISessionRow>(TABLE)
            .where('sid', '=', sid)
            .first();
        if (row) {
            return this.rowToSession(row);
        }
        throw new NotFoundError(`Could not find session with sid ${sid}`);
    }

    async deleteSessionsForUser(userId: number): Promise<void> {
        await this.db<ISessionRow>(TABLE)
            .whereRaw("(sess -> 'user' ->> 'id')::int = ?", [userId])
            .del();
    }

    async delete(sid: string): Promise<void> {
        await this.db<ISessionRow>(TABLE).where('sid', '=', sid).del();
    }

    async insertSession(data: Omit<ISession, 'createdAt'>): Promise<ISession> {
        const row = await this.db<ISessionRow>(TABLE)
            .insert({
                sid: data.sid,
                sess: JSON.stringify(data.sess),
                expired: data.expired || addDays(Date.now(), 1),
            })
            .returning<ISessionRow>([
                'id',
                'sid',
                'sess',
                'created_at',
                'expired',
            ]);
        if (row) {
            return this.rowToSession(row);
        }
        throw new Error('Could not insert session');
    }

    async deleteAll(): Promise<void> {
        await this.db(TABLE).del();
    }

    destroy(): void {}

    async exists(sid: string): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE sid = ?) AS present`,
            [sid],
        );
        const { present } = result.rows[0];
        return present;
    }

    async getAll(): Promise<ISession[]> {
        const rows = await this.db<ISessionRow>(TABLE);
        return rows.map(this.rowToSession);
    }

    async deleteSessionById(id: string): Promise<void> {
        await this.db<ISessionRow>(TABLE).where('id', '=', id).del();
    }

    private rowToSession(row: ISessionRow): ISession {
        return {
            id: row.id,
            sid: row.sid,
            sess: row.sess,
            createdAt: row.created_at,
            expired: row.expired,
        };
    }

    async getSessionsCount(): Promise<{ userId: number; count: number }[]> {
        const rows = await this.db(TABLE)
            .select(this.db.raw("sess->'user'->>'id' AS user_id"))
            .count('* as count')
            .groupBy('user_id');

        return rows.map((row) => ({
            userId: Number(row.user_id),
            count: Number(row.count),
        }));
    }

    async getMaxSessionsCount(): Promise<number> {
        const result = await this.db(TABLE)
            .select(this.db.raw("sess->'user'->>'id' AS user_id"))
            .count('* as count')
            .groupBy('user_id')
            .orderBy('count', 'desc')
            .first();

        return result ? Number(result.count) : 0;
    }
}
