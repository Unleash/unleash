import crypto from 'crypto';
import { ApiTokenStore, IApiToken, ApiTokenType } from '../db/api-token-store';
import { Logger, LogProvider } from '../logger';
import { ADMIN, CLIENT } from '../permissions';
import User from '../user';

const ONE_MINUTE = 60_000;

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

    private config: IConfig;

    private logger: Logger;

    private timer: NodeJS.Timeout;

    private activeTokens: IApiToken[] = [];

    constructor(stores: IStores, config: IConfig) {
        this.store = stores.apiTokenStore;
        this.config = config;
        this.logger = config.getLogger('/services/api-token-service.ts');
        this.fetchActiveTokens();
        this.timer = setInterval(
            () => this.fetchActiveTokens(),
            ONE_MINUTE,
        ).unref();
    }

    private async fetchActiveTokens(): Promise<void> {
        try {
            this.activeTokens = await this.getAllActiveTokens();
        } finally {
            // eslint-disable-next-line no-unsafe-finally
            return;
        }
    }

    public async getAllTokens(): Promise<IApiToken[]> {
        return this.store.getAll();
    }

    public async getAllActiveTokens(): Promise<IApiToken[]> {
        return this.store.getAllActive();
    }

    public getUserForToken(secret: string): User | undefined {
        const token = this.activeTokens.find(t => t.secret === secret);
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

    destroy() {
        clearInterval(this.timer);
        this.timer = null;
    }
}
