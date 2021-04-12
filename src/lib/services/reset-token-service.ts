import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { URL } from 'url';
import {
    ResetTokenStore,
    IResetToken,
    IResetQuery,
} from '../db/reset-token-store';
import { Logger, LogProvider } from '../logger';
import User from '../user';
import UserStore from '../db/user-store';
import UsedTokenError from '../error/used-token-error';
import { IUnleashConfig } from '../types/core';
import InvalidTokenError from '../error/invalid-token-error';

const ONE_DAY = 86_400_000;

interface IStores {
    resetTokenStore: ResetTokenStore;
    userStore: UserStore;
}

const getCreatedBy = (user: User) => user.email || user.username;

export default class ResetTokenService {
    private store: ResetTokenStore;

    private logger: Logger;

    private readonly unleashBase: URL;

    constructor(
        stores: IStores,
        { getLogger, baseUriPath, unleashUrl }: IUnleashConfig,
    ) {
        this.store = stores.resetTokenStore;
        this.logger = getLogger('/services/reset-token-service.ts');
        this.unleashBase = new URL(baseUriPath, unleashUrl);
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

    async createResetUrl(forUser: User, creator: User): Promise<URL> {
        const token = await this.createToken(forUser, creator);
        return Promise.resolve(
            new URL(
                `/auth/reset/validate?token=${token.token}`,
                this.unleashBase,
            ),
        );
    }

    async createToken(
        tokenUser: User,
        creator: User,
        expiryDelta: number = ONE_DAY,
    ): Promise<IResetToken> {
        const token = await this.generateToken();
        const expiry = new Date(new Date().getTime() + expiryDelta);
        await this.store.expireExistingTokensForUser(tokenUser.id);
        return this.store.insert({
            reset_token: token,
            user_id: tokenUser.id,
            expires_at: expiry,
            created_by: getCreatedBy(creator),
        });
    }

    private generateToken(): Promise<string> {
        return bcrypt.hash(crypto.randomBytes(32), 10);
    }
}

module.exports = ResetTokenService;
