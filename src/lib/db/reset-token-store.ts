import { EventEmitter } from 'events';
import { Knex } from 'knex';
import metricsHelper from '../util/metrics-helper';
import { DB_TIME } from '../metric-events';
import { Logger, LogProvider } from '../logger';
import NotFoundError from '../error/notfound-error';
import {
    IResetQuery,
    IResetToken,
    IResetTokenCreate,
    IResetTokenQuery,
    IResetTokenStore,
} from '../types/stores/reset-token-store';

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
    private logger: Logger;

    private timer: Function;

    private db: Knex;

    constructor(db: Knex, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('db/reset-token-store.ts');
        this.timer = (action: string) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'reset-tokens',
                action,
            });
    }

    async getActive(token: string): Promise<IResetToken> {
        const row = await this.db<IResetTokenTable>(TABLE)
            .where({ reset_token: token })
            .where('expires_at', '>', new Date())
            .first();
        if (!row) {
            throw new NotFoundError('Could not find an active token');
        }
        return rowToResetToken(row);
    }

    async getActiveTokens(): Promise<IResetToken[]> {
        const rows = await this.db<IResetTokenTable>(TABLE)
            .whereNull('used_at')
            .andWhere('expires_at', '>', new Date());

        return rows.map(rowToResetToken);
    }

    async insert(newToken: IResetTokenCreate): Promise<IResetToken> {
        const [row] = await this.db<IResetTokenTable>(TABLE)
            .insert(newToken)
            .returning(['created_at']);
        return {
            userId: newToken.user_id,
            token: newToken.reset_token,
            expiresAt: newToken.expires_at,
            createdAt: row.created_at,
            createdBy: newToken.created_by,
        };
    }

    async useToken(token: IResetQuery): Promise<boolean> {
        try {
            await this.db<IResetTokenTable>(TABLE)
                .update({ used_at: new Date() })
                .where({ reset_token: token.token, user_id: token.userId });
            return true;
        } catch (e) {
            return false;
        }
    }

    async deleteFromQuery({ reset_token }: IResetTokenQuery): Promise<void> {
        return this.db(TABLE).where(reset_token).del();
    }

    async deleteAll(): Promise<void> {
        return this.db(TABLE).del();
    }

    async deleteExpired(): Promise<void> {
        return this.db(TABLE).where('expires_at', '<', new Date()).del();
    }

    async expireExistingTokensForUser(user_id: number): Promise<void> {
        await this.db<IResetTokenTable>(TABLE).where({ user_id }).update({
            expires_at: new Date(),
        });
    }

    async delete(reset_token: string): Promise<void> {
        await this.db(TABLE).where({ reset_token }).del();
    }

    destroy(): void {}

    async exists(reset_token: string): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE reset_token = ?) AS present`,
            [reset_token],
        );
        const { present } = result.rows[0];
        return present;
    }

    async get(key: string): Promise<IResetToken> {
        const row = await this.db(TABLE).where({ reset_token: key }).first();
        return rowToResetToken(row);
    }

    async getAll(): Promise<IResetToken[]> {
        const rows = await this.db(TABLE).select();
        return rows.map(rowToResetToken);
    }
}
