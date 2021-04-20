import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { URL } from 'url';
import {
    ResetTokenStore,
    IResetToken,
    IResetQuery,
} from '../db/reset-token-store';
import { Logger } from '../logger';
import UserStore from '../db/user-store';
import UsedTokenError from '../error/used-token-error';
import InvalidTokenError from '../error/invalid-token-error';
import { IUnleashConfig } from '../types/option';

const ONE_DAY = 86_400_000;

interface IStores {
    resetTokenStore: ResetTokenStore;
    userStore: UserStore;
}

export default class ResetTokenService {
    private store: ResetTokenStore;

    private logger: Logger;

    private readonly unleashBase: URL;

    constructor(
        stores: IStores,
        { getLogger, server }: Pick<IUnleashConfig, 'getLogger' | 'server'>,
    ) {
        this.store = stores.resetTokenStore;
        this.logger = getLogger('/services/reset-token-service.ts');
        this.unleashBase = new URL(server.baseUriPath, server.unleashUrl);
    }

    async useAccessToken(token: IResetQuery): Promise<boolean> {
        try {
            await this.isValid(token.token);
            await this.store.useToken(token);
            return true;
        } catch (e) {
            return false;
        }
    }

    async isValid(token: string): Promise<IResetToken> {
        let t;
        try {
            t = await this.store.getActive(token);
            if (!t.usedAt) {
                return t;
            }
        } catch (e) {
            throw new InvalidTokenError();
        }
        throw new UsedTokenError(t.usedAt);
    }

    private async createResetUrl(
        forUser: number,
        creator: string,
        path: string,
    ): Promise<URL> {
        const token = await this.createToken(forUser, creator);
        return Promise.resolve(
            new URL(`${path}?token=${token.token}`, this.unleashBase),
        );
    }

    async createResetPasswordUrl(
        forUser: number,
        creator: string,
    ): Promise<URL> {
        const path = '/#/reset-password';
        return this.createResetUrl(forUser, creator, path);
    }

    async createNewUserUrl(forUser: number, creator: string): Promise<URL> {
        const path = '/#/new-user';
        return this.createResetUrl(forUser, creator, path);
    }

    async createToken(
        tokenUser: number,
        creator: string,
        expiryDelta: number = ONE_DAY,
    ): Promise<IResetToken> {
        const token = await this.generateToken();
        const expiry = new Date(Date.now() + expiryDelta);
        await this.store.expireExistingTokensForUser(tokenUser);
        return this.store.insert({
            reset_token: token,
            user_id: tokenUser,
            expires_at: expiry,
            created_by: creator,
        });
    }

    private generateToken(): Promise<string> {
        return bcrypt.hash(crypto.randomBytes(32), 10);
    }
}

module.exports = ResetTokenService;
