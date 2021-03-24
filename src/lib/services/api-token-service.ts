import crypto from 'crypto';
import { ApiTokenStore, IApiToken, ApiTokenType } from '../db/api-token-store';
import { Logger, LogProvider } from '../logger';

interface IStores {
    apiTokenStore: ApiTokenStore;
}

interface IConfig {
    getLogger: LogProvider;
}

interface CreateTokenRequest {
    username: string;
    type: ApiTokenType;
    expiresAt?: Date;
}

export class ApiTokenService {
    private store: ApiTokenStore;

    private logger: Logger;

    constructor({ apiTokenStore }: IStores, { getLogger }: IConfig) {
        this.store = apiTokenStore;
        this.logger = getLogger('/services/api-token-service.ts');
    }

    public async getAllTokens(): Promise<IApiToken[]> {
        return this.store.getAll();
    }

    public async getAllActiveTokens(): Promise<IApiToken[]> {
        return this.store.getAllActive();
    }

    public async updateExpiry(
        secret: string,
        expiresAt: Date,
    ): Promise<IApiToken> {
        return this.store.setExpiry(secret, expiresAt);
    }

    public async delete(secret: string): Promise<void> {
        return this.store.delete(secret);
    }

    public async creteApiToken(
        creteTokenRequest: CreateTokenRequest,
    ): Promise<IApiToken> {
        const secret = this.generateSecretKey();
        const createNewToken = { ...creteTokenRequest, secret };
        return this.store.insert(createNewToken);
    }

    private generateSecretKey() {
        return crypto.randomBytes(32).toString('hex');
    }
}
