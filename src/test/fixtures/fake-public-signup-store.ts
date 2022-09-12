import { IPublicSignupTokenStore } from '../../lib/types/stores/public-signup-token-store';
import { PublicSignupTokenSchema } from '../../lib/openapi/spec/public-signup-token-schema';
import { IPublicSignupTokenCreate } from '../../lib/types/models/public-signup-token';

export default class FakePublicSignupStore implements IPublicSignupTokenStore {
    tokens: PublicSignupTokenSchema[] = [];

    async addTokenUser(secret: string, userId: number): Promise<void> {
        this.get(secret).then((token) => token.users.push({ id: userId }));
        return Promise.resolve();
    }

    async get(secret: string): Promise<PublicSignupTokenSchema> {
        const token = this.tokens.find((t) => t.secret === secret);
        return Promise.resolve(token);
    }

    async count(): Promise<number> {
        return Promise.resolve(0);
    }

    // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
    async delete(secret: string): Promise<void> {
        return Promise.resolve(undefined);
    }

    async getAllActive(): Promise<PublicSignupTokenSchema[]> {
        return Promise.resolve(this.tokens);
    }

    async insert(
        newToken: IPublicSignupTokenCreate,
    ): Promise<PublicSignupTokenSchema> {
        const token = {
            secret: 'some-secret',
            expiresAt: newToken.expiresAt.toISOString(),
            createdAt: new Date().toISOString(),
            users: [],
            name: newToken.name,
            role: {
                name: 'Viewer',
                type: '',
                id: 1,
            },
            createdBy: null,
        };
        this.tokens.push(token);
        return Promise.resolve(token);
    }

    async setExpiry(
        secret: string,
        expiresAt: Date,
    ): Promise<PublicSignupTokenSchema> {
        const token = await this.get(secret);
        token.expiresAt = expiresAt.toISOString();
        return Promise.resolve(token);
    }

    async deleteAll(): Promise<void> {
        return Promise.resolve(undefined);
    }

    destroy(): void {}

    async exists(key: string): Promise<boolean> {
        return this.tokens.some((t) => t.secret === key);
    }

    // eslint-disable-next-line no-unused-vars,@typescript-eslint/no-unused-vars
    async getAll(query?: Object): Promise<PublicSignupTokenSchema[]> {
        return Promise.resolve([]);
    }
}
