import crypto from 'crypto';
import { ApiTokenStore, IApiToken, ApiTokenType } from '../db/api-token-store';
import { Logger, LogProvider } from '../logger';
import { ADMIN, CLIENT } from '../permissions';
import User from '../user';


interface IStores {
    apiTokenStore: ApiTokenStore;
    settingStore: any;
}

interface IConfig {
    getLogger: LogProvider;
    baseUriPath: string;
}

interface CreateTokenRequest {
    username: string;
    type: ApiTokenType;
    expiresAt?: Date;
}

export class ApiTokenService {
    private store: ApiTokenStore;

    private settingStore: any;

    private config: IConfig;

    private logger: Logger;

    constructor(stores: IStores, config: IConfig) {
        this.store = stores.apiTokenStore;
        this.settingStore = stores.settingStore;
        this.config = config;
        this.logger = config.getLogger('/services/api-token-service.ts');
    }

    public async getAllTokens(): Promise<IApiToken[]> {
        return this.store.getAll();
    }

    public async getAllActiveTokens(): Promise<IApiToken[]> {
        return this.store.getAllActive();
    }

    public async getUserForToken(secret: string): Promise<User | undefined> {
        // TODO: memoize this.
        const tokens = await this.store.getAllActive();
        const token = tokens.find(t => t.secret === secret);
        if (token) {
            const permissions =
                token.type === ApiTokenType.ADMIN ? [ADMIN] : [CLIENT];

            return new User({
                isAPI: true,
                username: token.username,
                permissions,
            });
        }
        return undefined;
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
