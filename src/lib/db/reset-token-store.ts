import type { EventEmitter } from 'events';
import metricsHelper from '../util/metrics-helper.js';
import { DB_TIME } from '../metric-events.js';
import type { LogProvider } from '../logger.js';
import NotFoundError from '../error/notfound-error.js';
import type {
    IResetQuery,
    IResetToken,
    IResetTokenCreate,
    IResetTokenQuery,
    IResetTokenStore,
} from '../types/stores/reset-token-store.js';
import type { Db } from './db.js';

const TABLE = 'reset_tokens';

interface IResetTokenTable {
    reset_token: string;
    user_id: number;
    expires_at: Date;
    created_at: Date;
    created_by: string;
    used_at: Date;
}

const rowToResetToken = (row: IResetTokenTable): IResetToken => ({
    userId: row.user_id,
    token: row.reset_token,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
    createdBy: row.created_by,
    usedAt: row.used_at,
});

export class ResetTokenStore implements IResetTokenStore {
    private db: Db;

    private timer: Function;

    constructor(db: Db, eventBus: EventEmitter, _getLogger: LogProvider) {
        this.db = db;
        this.timer = (action: string) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'reset-tokens',
                action,
            });
    }

    async getActive(token: string): Promise<IResetToken> {
        const stop = this.timer('getActive');
        const row = await this.db<IResetTokenTable>(TABLE)
            .where({ reset_token: token })
            .where('expires_at', '>', new Date())
            .first();
        stop();
        if (!row) {
            throw new NotFoundError('Could not find an active token');
        }
        return rowToResetToken(row);
    }

    async getActiveTokens(): Promise<IResetToken[]> {
        const stop = this.timer('getActiveTokens');
        const rows = await this.db<IResetTokenTable>(TABLE)
            .whereNull('used_at')
            .andWhere('expires_at', '>', new Date());
        stop();
        return rows.map(rowToResetToken);
    }

    async insert(newToken: IResetTokenCreate): Promise<IResetToken> {
        const stop = this.timer('insert_token');
        const [row] = await this.db<IResetTokenTable>(TABLE)
            .insert(newToken)
            .returning(['created_at']);
        stop();
        return {
            userId: newToken.user_id,
            token: newToken.reset_token,
            expiresAt: newToken.expires_at,
            createdAt: row.created_at,
            createdBy: newToken.created_by,
        };
    }

    async useToken(token: IResetQuery): Promise<boolean> {
        const stop = this.timer('use_token');
        try {
            await this.db<IResetTokenTable>(TABLE)
                .update({ used_at: new Date() })
                .where({ reset_token: token.token, user_id: token.userId });
            return true;
        } catch (_e) {
            return false;
        } finally {
            stop();
        }
    }

    async deleteFromQuery({ reset_token }: IResetTokenQuery): Promise<void> {
        const stop = this.timer('deleteFromQuery');
        await this.db(TABLE).where(reset_token).del();
        stop();
    }

    async deleteAll(): Promise<void> {
        const stop = this.timer('deleteAll');
        await this.db(TABLE).del();
        stop();
    }

    async deleteExpired(): Promise<void> {
        const stop = this.timer('deleteExpired');
        await this.db(TABLE).where('expires_at', '<', new Date()).del();
        stop();
    }

    async expireExistingTokensForUser(user_id: number): Promise<void> {
        const stop = this.timer('expireExistingTokensForUser');
        await this.db<IResetTokenTable>(TABLE).where({ user_id }).update({
            expires_at: new Date(),
        });
        stop();
    }

    async delete(reset_token: string): Promise<void> {
        const stop = this.timer('delete');
        await this.db(TABLE).where({ reset_token }).del();
        stop();
    }

    destroy(): void {}

    async exists(reset_token: string): Promise<boolean> {
        const stop = this.timer('exists');
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE reset_token = ?) AS present`,
            [reset_token],
        );
        stop();
        const { present } = result.rows[0];
        return present;
    }

    async get(key: string): Promise<IResetToken> {
        const stop = this.timer('get');
        const row = await this.db(TABLE).where({ reset_token: key }).first();
        stop();
        return rowToResetToken(row);
    }

    async getAll(): Promise<IResetToken[]> {
        const stop = this.timer('getAll');
        const rows = await this.db(TABLE).select();
        stop();
        return rows.map(rowToResetToken);
    }
}
