import crypto from 'crypto';
import { ApiTokenStore, IApiToken, ApiTokenType } from '../db/api-token.store';

interface IStores {
    apiTokenStore: ApiTokenStore;
}

interface IConfig {
    getLogger: Function;
}

interface CreateTokenRequest {
    username: string;
    type: ApiTokenType;
    expiresAt?: Date;
}

export class ApiTokenService {
    private store: ApiTokenStore;

    private logger: Function;

    constructor({ apiTokenStore }: IStores, { getLogger }: IConfig) {
        this.store = apiTokenStore;
        this.logger = getLogger('/services/api-token-service.ts');
    }

    async getAllTokens(): Promise<IApiToken[]> {
        return this.store.getAll();
    }

    async getAllActiveTokens(): Promise<IApiToken[]> {
        return this.store.getAllActive();
    }

    async creteApiToken(
        creteTokenRequest: CreateTokenRequest,
    ): Promise<IApiToken> {
        const secret = this.generateSecretKey();
        const createNewToken = { ...creteTokenRequest, secret };
        return this.store.insert(createNewToken);
    }

    private generateSecretKey() {
        return crypto.randomBytes(16).toString('hex');
    }
}

module.exports = ApiTokenService;
