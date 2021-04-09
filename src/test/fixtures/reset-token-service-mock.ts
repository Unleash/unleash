/* eslint-disable @typescript-eslint/no-unused-vars */
import { URL } from 'url';
import ResetTokenService from '../../lib/services/reset-token-service';
import noLoggerProvider from './no-logger';
import { IResetQuery, IResetToken } from '../../lib/db/reset-token-store';
import User from '../../lib/user';

export default class ResetTokenServiceMock extends ResetTokenService {
    constructor() {
        super(
            { resetTokenStore: undefined, userStore: undefined },
            { getLogger: noLoggerProvider, baseUriPath: '' },
        );
    }

    async useAccessToken(token: IResetQuery): Promise<boolean> {
        throw new Error('Method not implemented');
    }

    async isValid(token: IResetQuery): Promise<IResetToken> {
        throw new Error('Method not implemented');
    }

    async createResetUrl(forUser: User, creator: User): Promise<URL> {
        throw new Error('Method not implemented');
    }

    async createToken(
        tokenUser: User,
        creator: User,
        expiryDelta: number = 86_400_000,
    ): Promise<IResetToken> {
        throw new Error('Method not implemented');
    }
}
