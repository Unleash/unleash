import { IApiTokenStore } from '../../lib/types/stores/api-token-store';
import { IApiToken, IApiTokenCreate } from '../../lib/types/models/api-token';

import NotFoundError from '../../lib/error/notfound-error';
import EventEmitter from 'events';

export default class FakeApiTokenStore
    extends EventEmitter
    implements IApiTokenStore
{
    tokens: IApiToken[] = [];

    async delete(key: string): Promise<void> {
        this.tokens.splice(
            this.tokens.findIndex((t) => t.secret === key),
            1,
        );
    }

    async count(): Promise<number> {
        return this.tokens.length;
    }

    async deleteAll(): Promise<void> {
        this.tokens = [];
    }

    destroy(): void {}

    async exists(key: string): Promise<boolean> {
        return this.tokens.some((token) => token.secret === key);
    }

    async get(key: string): Promise<IApiToken> {
        const token = this.tokens.find((t) => t.secret === key);
        if (token) {
            return token;
        }
        throw new NotFoundError(`Could not find token with secret ${key}`);
    }

    async getAll(): Promise<IApiToken[]> {
        return this.tokens;
    }

    async getAllActive(): Promise<IApiToken[]> {
        return this.tokens.filter(
            (token) => token.expiresAt === null || token.expiresAt > new Date(),
        );
    }

    async insert(newToken: IApiTokenCreate): Promise<IApiToken> {
        const apiToken = {
            createdAt: new Date(),
            project: newToken.projects?.join(',') || '*',
            alias: null,
            ...newToken,
        };
        this.tokens.push(apiToken);
        this.emit('insert');
        return apiToken;
    }

    async markSeenAt(secrets: string[]): Promise<void> {
        this.tokens
            .filter((t) => secrets.includes(t.secret))
            .forEach((t) => {
                // eslint-disable-next-line no-param-reassign
                t.seenAt = new Date();
            });
    }

    async setExpiry(secret: string, expiresAt: Date): Promise<IApiToken> {
        const t = await this.get(secret);
        t.expiresAt = expiresAt;
        return t;
    }
}
