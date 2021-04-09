import { EventEmitter } from 'events';
import {
    IResetToken,
    IResetTokenCreate,
    IResetTokenQuery,
    ResetTokenStore,
} from '../../lib/db/reset-token-store';
import noLoggerProvider from './no-logger';
import NotFoundError from '../../lib/error/notfound-error';

export class ResetTokenStoreMock extends ResetTokenStore {
    data: IResetToken[];

    constructor() {
        super(undefined, new EventEmitter(), noLoggerProvider);
        this.data = [];
    }

    async getActive({ userId, token }: IResetToken): Promise<IResetToken> {
        const row = this.data.find(
            tokens => tokens.token === token && tokens.userId === userId,
        );
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
            createdAt: new Date(),
        };
        this.data.push(token);
        return Promise.resolve(token);
    }

    async delete({ reset_token }: IResetTokenQuery): Promise<void> {
        this.data.splice(
            this.data.findIndex(token => token.token === reset_token),
            1,
        );
        return Promise.resolve();
    }

    async deleteExpired(): Promise<void> {
        throw new Error('Not implemented in mock');
    }
}
