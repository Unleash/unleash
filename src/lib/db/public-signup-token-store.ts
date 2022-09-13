import { EventEmitter } from 'events';
import { Knex } from 'knex';
import metricsHelper from '../util/metrics-helper';
import { DB_TIME } from '../metric-events';
import { Logger, LogProvider } from '../logger';
import NotFoundError from '../error/notfound-error';
import { PublicSignupTokenSchema } from '../openapi/spec/public-signup-token-schema';
import { IPublicSignupTokenStore } from '../types/stores/public-signup-token-store';
import { UserSchema } from '../openapi/spec/user-schema';
import { IPublicSignupTokenCreate } from '../types/models/public-signup-token';

const TABLE = 'public_signup_tokens';
const TOKEN_USERS_TABLE = 'public_signup_token_users';

interface ITokenInsert {
    secret: string;
    name: string;
    expires_at: Date;
    created_at: Date;
    created_by?: string;
    role_id: number;
}

interface ITokenRow extends ITokenInsert {
    users: UserSchema[];
}

interface ITokenUserRow {
    secret: string;
    user_id: number;
    created_at: Date;
}
const tokenRowReducer = (acc, tokenRow) => {
    const { userId, name, ...token } = tokenRow;
    if (!acc[tokenRow.secret]) {
        acc[tokenRow.secret] = {
            secret: token.secret,
            name: token.name,
            expiresAt: token.expires_at,
            createdAt: token.created_at,
            createdBy: token.created_by,
            roleId: token.role_id,
            users: [],
        };
    }
    const currentToken = acc[tokenRow.secret];
    if (userId) {
        currentToken.users.push({ userId, name });
    }
    return acc;
};

const toRow = (newToken: IPublicSignupTokenCreate) => ({
    secret: newToken.secret,
    name: newToken.name,
    expires_at: newToken.expiresAt,
    created_by: newToken.createdBy || null,
    role_id: newToken.roleId,
});

const toTokens = (rows: any[]): PublicSignupTokenSchema[] => {
    const tokens = rows.reduce(tokenRowReducer, {});
    return Object.values(tokens);
};

export class PublicSignupTokenStore implements IPublicSignupTokenStore {
    private logger: Logger;

    private timer: Function;

    private db: Knex;

    constructor(db: Knex, eventBus: EventEmitter, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('public-signup-tokens.js');
        this.timer = (action: string) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'public-signup-tokens',
                action,
            });
    }

    count(): Promise<number> {
        return this.db(TABLE)
            .count('*')
            .then((res) => Number(res[0].count));
    }

    private makeTokenUsersQuery() {
        return this.db<ITokenRow>(`${TABLE} as tokens`)
            .leftJoin(
                `${TOKEN_USERS_TABLE} as token_project_users`,
                'tokens.secret',
                'token_project_users.secret',
            )
            .leftJoin(`users`, 'token_project_users.user_id', 'users.id')
            .select(
                'tokens.secret',
                'tokens.name',
                'tokens.expires_at',
                'tokens.created_at',
                'tokens.created_by',
                'tokens.role_id',
                'token_project_users.user_id',
                'users.name',
            );
    }

    async getAll(): Promise<PublicSignupTokenSchema[]> {
        const stopTimer = this.timer('getAll');
        const rows = await this.makeTokenUsersQuery();
        stopTimer();
        return toTokens(rows);
    }

    async getAllActive(): Promise<PublicSignupTokenSchema[]> {
        const stopTimer = this.timer('getAllActive');
        const rows = await this.makeTokenUsersQuery()
            .where('expires_at', 'IS', null)
            .orWhere('expires_at', '>', 'now()');
        stopTimer();
        return toTokens(rows);
    }

    async addTokenUser(secret: string, userId: number): Promise<void> {
        await this.db.transaction(async (tx) => {
            await tx<ITokenUserRow>(TOKEN_USERS_TABLE).insert(
                { user_id: userId, secret },
                ['created_at'],
            );
        });
    }

    async insert(
        newToken: IPublicSignupTokenCreate,
    ): Promise<PublicSignupTokenSchema> {
        const response = await this.db.transaction(async (tx) => {
            const [row] = await tx<ITokenRow>(TABLE).insert(toRow(newToken), [
                'created_at',
            ]);
            return {
                ...newToken,
                createdAt: row.created_at,
                users: [],
            };
        });
        return toTokens([response])[0];
    }

    destroy(): void {}

    async exists(secret: string): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE secret = ?) AS present`,
            [secret],
        );
        const { present } = result.rows[0];
        return present;
    }

    async get(key: string): Promise<PublicSignupTokenSchema> {
        const row = await this.makeTokenUsersQuery()
            .where('secret', key)
            .first();

        if (!row)
            throw new NotFoundError('Could not find a token with that key');

        return toTokens([row])[0];
    }

    async delete(secret: string): Promise<void> {
        return this.db<ITokenInsert>(TABLE).where({ secret }).del();
    }

    async deleteAll(): Promise<void> {
        return this.db<ITokenInsert>(TABLE).del();
    }

    async setExpiry(
        secret: string,
        expiresAt: Date,
    ): Promise<PublicSignupTokenSchema> {
        const rows = await this.makeTokenUsersQuery()
            .update({ expires_at: expiresAt })
            .where('secret', secret)
            .returning('*');
        if (rows.length > 0) {
            return toTokens(rows)[0];
        }
        throw new NotFoundError('Could not find public signup token.');
    }
}
