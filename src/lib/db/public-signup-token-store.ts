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
const TOKEN_USERS_TABLE = 'public_signup_tokens_user';

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
    const {
        userId,
        userName,
        userUsername,
        roleId,
        roleName,
        roleType,
        ...token
    } = tokenRow;
    if (!acc[tokenRow.secret]) {
        acc[tokenRow.secret] = {
            secret: token.secret,
            name: token.name,
            url: token.url,
            expiresAt: token.expires_at,
            enabled: token.enabled,
            createdAt: token.created_at,
            createdBy: token.created_by,
            role: {
                id: roleId,
                name: roleName,
                type: roleType,
            },
            users: [],
        };
    }
    const currentToken = acc[tokenRow.secret];
    if (userId) {
        currentToken.users.push({
            id: userId,
            name: userName,
            username: userUsername,
        });
    }
    return acc;
};

const toRow = (newToken: IPublicSignupTokenCreate) => {
    if (!newToken) return;
    return {
        secret: newToken.secret,
        name: newToken.name,
        expires_at: newToken.expiresAt,
        created_by: newToken.createdBy || null,
        role_id: newToken.roleId,
        url: newToken.url,
    };
};

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
            .leftJoin(`roles`, 'tokens.role_id', 'roles.id')
            .select(
                'tokens.secret',
                'tokens.name',
                'tokens.expires_at',
                'tokens.enabled',
                'tokens.created_at',
                'tokens.created_by',
                'tokens.url',
                'token_project_users.user_id as userId',
                'users.name as userName',
                'users.username as userUsername',
                'roles.id as roleId',
                'roles.name as roleName',
                'roles.type as roleType',
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
        await this.db<ITokenUserRow>(TOKEN_USERS_TABLE).insert(
            { user_id: userId, secret },
            ['created_at'],
        );
    }

    async insert(
        newToken: IPublicSignupTokenCreate,
    ): Promise<PublicSignupTokenSchema> {
        const response = await this.db<ITokenRow>(TABLE).insert(
            toRow(newToken),
            ['secret'],
        );
        return this.get(response[0].secret);
    }

    async isValid(secret: string): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE secret = ? AND expires_at::date > ? AND enabled = true) AS valid`,
            [secret, new Date()],
        );
        const { valid } = result.rows[0];
        return valid;
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
        const rows = await this.makeTokenUsersQuery().where(
            'tokens.secret',
            key,
        );

        if (rows.length > 0) {
            return toTokens(rows)[0];
        }
        throw new NotFoundError('Could not find public signup token.');
    }

    async delete(secret: string): Promise<void> {
        return this.db<ITokenInsert>(TABLE).where({ secret }).del();
    }

    async deleteAll(): Promise<void> {
        return this.db<ITokenInsert>(TABLE).del();
    }

    async update(
        secret: string,
        { expiresAt, enabled }: { expiresAt?: Date; enabled?: boolean },
    ): Promise<PublicSignupTokenSchema> {
        const rows = await this.makeTokenUsersQuery()
            .update({ expires_at: expiresAt, enabled })
            .where('secret', secret)
            .returning('*');
        if (rows.length > 0) {
            return toTokens(rows)[0];
        }
        throw new NotFoundError('Could not find public signup token.');
    }
}
