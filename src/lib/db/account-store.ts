import { Knex } from 'knex';
import { Logger, LogProvider } from '../logger';

import NotFoundError from '../error/notfound-error';
import { IAccountStore } from '../types/stores/account-store';
import { generateImageUrl } from '../util';
import { IAccount } from '../types/account';

const TABLE = 'users';

const COLUMNS = [
    'id',
    'name',
    'username',
    'email',
    'image_url',
    'created_at',
    'is_service',
];

const emptify = (value) => {
    if (!value) {
        return undefined;
    }
    return value;
};

const rowToAccount = (row): IAccount => {
    if (!row) {
        throw new NotFoundError('No account found');
    }

    const account: IAccount = {
        id: row.id,
        type: row.is_service ? 'Service Account' : 'User',
        name: emptify(row.name),
        username: emptify(row.username),
        email: emptify(row.email),
        createdAt: row.created_at,
        imageUrl: emptify(row.image_url),
    };

    return { ...account, imageUrl: generateImageUrl(account) };
};

export class AccountStore implements IAccountStore {
    private db: Knex;

    private logger: Logger;

    constructor(db: Knex, getLogger: LogProvider) {
        this.db = db;
        this.logger = getLogger('account-store.ts');
    }

    activeAccounts(): any {
        return this.db(TABLE).where({
            deleted_at: null,
        });
    }

    async getAll(): Promise<IAccount[]> {
        const accounts = await this.activeAccounts().select(COLUMNS);
        return accounts.map(rowToAccount);
    }

    async getAllWithId(accountIdList: number[]): Promise<IAccount[]> {
        const accounts = await this.activeAccounts()
            .select(COLUMNS)
            .whereIn('id', accountIdList);
        return accounts.map(rowToAccount);
    }

    async delete(id: number): Promise<void> {
        return this.activeAccounts()
            .where({ id })
            .update({
                deleted_at: new Date(),
                email: null,
                username: null,
                name: this.db.raw('name || ?', '(Deleted)'),
            });
    }

    async deleteAll(): Promise<void> {
        await this.activeAccounts().del();
    }

    destroy(): void {}

    async exists(id: number): Promise<boolean> {
        const result = await this.db.raw(
            `SELECT EXISTS (SELECT 1 FROM ${TABLE} WHERE id = ? and deleted_at = null) AS present`,
            [id],
        );
        const { present } = result.rows[0];
        return present;
    }

    async get(id: number): Promise<IAccount> {
        const row = await this.activeAccounts().where({ id }).first();
        return rowToAccount(row);
    }

    async getAccountByPersonalAccessToken(secret: string): Promise<IAccount> {
        const row = await this.activeAccounts()
            .select(COLUMNS.map((column) => `${TABLE}.${column}`))
            .leftJoin(
                'personal_access_tokens',
                'personal_access_tokens.user_id',
                `${TABLE}.id`,
            )
            .where('secret', secret)
            .andWhere('expires_at', '>', 'now()')
            .first();
        return rowToAccount(row);
    }

    async markSeenAt(secrets: string[]): Promise<void> {
        const now = new Date();
        try {
            await this.db('personal_access_tokens')
                .whereIn('secret', secrets)
                .update({ seen_at: now });
        } catch (err) {
            this.logger.error('Could not update lastSeen, error: ', err);
        }
    }
}
