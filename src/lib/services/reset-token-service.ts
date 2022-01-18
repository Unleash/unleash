import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { URL } from 'url';
import { Logger } from '../logger';
import UsedTokenError from '../error/used-token-error';
import InvalidTokenError from '../error/invalid-token-error';
import { IUnleashConfig } from '../types/option';
import { IUnleashStores } from '../types/stores';
import {
    IResetQuery,
    IResetToken,
    IResetTokenStore,
} from '../types/stores/reset-token-store';
import { hoursToMilliseconds } from 'date-fns';

interface IInviteLinks {
    [key: string]: string;
}

export default class ResetTokenService {
    private store: IResetTokenStore;

    private logger: Logger;

    private readonly unleashBase: string;

    constructor(
        { resetTokenStore }: Pick<IUnleashStores, 'resetTokenStore'>,
        { getLogger, server }: Pick<IUnleashConfig, 'getLogger' | 'server'>,
    ) {
        this.store = resetTokenStore;
        this.logger = getLogger('/services/reset-token-service.ts');
        this.unleashBase = server.unleashUrl;
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

    async getActiveInvitations(): Promise<IInviteLinks> {
        try {
            const tokens = await this.store.getActiveTokens();
            const links = tokens.reduce((acc, token) => {
                const inviteLink =
                    this.getExistingInvitationUrl(token).toString();

                acc[token.userId] = inviteLink;

                return acc;
            }, {});

            return links;
        } catch (e) {
            return {};
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

    private getExistingInvitationUrl(token: IResetToken) {
        return new URL(`${this.unleashBase}/new-user?token=${token.token}`);
    }

    private async createResetUrl(
        forUser: number,
        creator: string,
        path: string,
    ): Promise<URL> {
        const token = await this.createToken(forUser, creator);
        return Promise.resolve(
            new URL(`${this.unleashBase}${path}?token=${token.token}`),
        );
    }

    async createResetPasswordUrl(
        forUser: number,
        creator: string,
    ): Promise<URL> {
        const path = '/reset-password';
        return this.createResetUrl(forUser, creator, path);
    }

    async createNewUserUrl(forUser: number, creator: string): Promise<URL> {
        const path = '/new-user';
        return this.createResetUrl(forUser, creator, path);
    }

    async createToken(
        tokenUser: number,
        creator: string,
        expiryDelta: number = hoursToMilliseconds(24),
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
        return bcrypt.hash(crypto.randomBytes(32).toString(), 10);
    }
}

module.exports = ResetTokenService;
