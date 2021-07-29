import NotFoundError from '../../lib/error/notfound-error';
import {
    IResetQuery,
    IResetToken,
    IResetTokenCreate,
    IResetTokenQuery,
    IResetTokenStore,
} from '../../lib/types/stores/reset-token-store';

export default class FakeResetTokenStore implements IResetTokenStore {
    data: IResetToken[];

    constructor() {
        this.data = [];
    }

    async getActive(token: string): Promise<IResetToken> {
        const row = this.data.find((tokens) => tokens.token === token);
        if (!row) {
            throw new NotFoundError();
        }
        return row;
    }

    async insert(newToken: IResetTokenCreate): Promise<IResetToken> {
        const token = {
            userId: newToken.user_id,
            token: newToken.reset_token,
            expiresAt: newToken.expires_at,
            createdBy: newToken.created_by,
            createdAt: new Date(),
        };
        this.data.push(token);
        return Promise.resolve(token);
    }

    async delete(token: string): Promise<void> {
        this.data.splice(
            this.data.findIndex((t) => t.token === token),
            1,
        );
        return Promise.resolve();
    }

    async deleteExpired(): Promise<void> {
        throw new Error('Not implemented in mock');
    }

    async deleteAll(): Promise<void> {
        this.data = [];
    }

    async deleteFromQuery(query: IResetTokenQuery): Promise<void> {
        this.data = this.data.filter(
            (t) => t.userId !== query.user_id && t.token !== query.reset_token,
        );
    }

    destroy(): void {}

    async exists(token: string): Promise<boolean> {
        return this.data.some((f) => f.token === token);
    }

    async expireExistingTokensForUser(user_id: number): Promise<void> {
        this.data
            .filter((f) => f.userId === user_id)
            .forEach((t) => {
                // eslint-disable-next-line no-param-reassign
                t.expiresAt = new Date();
            });
    }

    async get(token: string): Promise<IResetToken> {
        return this.data.find((t) => t.token === token);
    }

    async getActiveTokens(): Promise<IResetToken[]> {
        const now = new Date();
        return this.data.filter((t) => t.expiresAt > now);
    }

    async getAll(): Promise<IResetToken[]> {
        return this.data;
    }

    async useToken(token: IResetQuery): Promise<boolean> {
        if (this.exists(token.token)) {
            const d = this.data.find(
                (t) => t.usedAt === null && t.token === token.token,
            );
            d.usedAt = new Date();
            return true;
        }
        return false;
    }
}
