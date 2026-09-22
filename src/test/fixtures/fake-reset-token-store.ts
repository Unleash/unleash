import NotFoundError from '../../lib/error/notfound-error.js';
import type {
    IResetQuery,
    IResetToken,
    IResetTokenCreate,
    IResetTokenQuery,
    IResetTokenStore,
} from '../../lib/types/stores/reset-token-store.js';

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
            createdBy: newToken.created_by || 'system-user',
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
        const foundToken = this.data.find((t) => t.token === token);
        if (foundToken === undefined) {
            throw new NotFoundError('Could find token');
        }
        return Promise.resolve(foundToken);
    }

    async getActiveTokens(): Promise<IResetToken[]> {
        const now = new Date();
        return this.data.filter((t) => !t.usedAt && t.expiresAt > now);
    }

    async getAll(): Promise<IResetToken[]> {
        return this.data;
    }

    async useToken(token: IResetQuery): Promise<boolean> {
        const now = new Date();
        const match = this.data.find(
            (t) =>
                t.token === token.token &&
                t.userId === token.userId &&
                !t.usedAt &&
                t.expiresAt > now,
        );
        if (match != null) {
            match.usedAt = new Date();
        }
        return match != null;
    }

    async consumeToken(token: string): Promise<number | undefined> {
        const now = new Date();
        const match = this.data.find(
            (t) => t.token === token && !t.usedAt && t.expiresAt > now,
        );
        if (match != null) {
            match.usedAt = new Date();
        }
        return match?.userId;
    }
}
