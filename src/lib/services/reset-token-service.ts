import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { URL } from 'url';
import type { Logger } from '../logger.js';
import UsedTokenError from '../error/used-token-error.js';
import InvalidTokenError from '../error/invalid-token-error.js';
import type { IUnleashConfig } from '../types/option.js';
import type { IUnleashStores } from '../types/stores.js';
import type {
    IResetQuery,
    IResetToken,
    IResetTokenStore,
} from '../types/stores/reset-token-store.js';
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
        return this.store.useToken(token);
    }

    /**
     * Atomically validates and consumes a single-use reset/invite token.
     * Exactly one concurrent caller can succeed for a given token
     * (GHSA-36wh-fxff-4h93 / TOCTOU on isValid + useToken).
     * @returns the user id that owned the consumed token
     */
    async consumeToken(token: string): Promise<number> {
        const userId = await this.store.consumeToken(token);
        if (userId == null) {
            // Distinguish used vs missing/expired for clearer errors.
            await this.isValid(token);
            throw new InvalidTokenError();
        }
        return userId;
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
        } catch (_e) {
            return {};
        }
    }

    expireExistingTokensForUser = async (userId: number): Promise<void> => {
        return this.store.expireExistingTokensForUser(userId);
    };

    async isValid(token: string): Promise<IResetToken> {
        let t: IResetToken;
        try {
            t = await this.store.getActive(token);
            if (!t.usedAt) {
                return t;
            }
        } catch (_e) {
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
        await this.expireExistingTokensForUser(tokenUser);
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
