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

const ONE_DAY = 86_400_000;

interface IStores {
    resetTokenStore: ResetTokenStore;
    userStore: UserStore;
}

export interface IConfig {
    getLogger: LogProvider;
    baseUriPath: string;
}

const getCreatedBy = (user: User) => user.email || user.username;

export default class ResetTokenService {
    private store: ResetTokenStore;

    private logger: Logger;

    private readonly baseUriPath: string;

    constructor(stores: IStores, { getLogger, baseUriPath }: IConfig) {
        this.store = stores.resetTokenStore;
        this.logger = getLogger('/services/reset-token-service.ts');
        this.baseUriPath = baseUriPath;
    }

    async useAccessToken(token: IResetQuery): Promise<boolean> {
        try {
            await this.isValid(token);
            await this.store.useToken(token);
            return true;
        } catch (e) {
            return false;
        }
    }

    async isValid(token: IResetQuery): Promise<IResetToken> {
        const t = await this.store.getActive(token);
        if (!t.usedAt) {
            return t;
        }
        throw new UsedTokenError(t.usedAt);
    }

    async createResetUrl(forUser: User, creator: User): Promise<URL> {
        const token = await this.createToken(forUser, creator);
        return Promise.resolve(
            new URL(`/auth/setpassword?token=${token.token}`, this.baseUriPath),
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
