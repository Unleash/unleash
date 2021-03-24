import crypto from 'crypto';
import AuthenticationRequired from '../authentication-required';
import { ApiTokenStore, IApiToken, ApiTokenType } from '../db/api-token-store';
import { Logger, LogProvider } from '../logger';
import { ADMIN, CLIENT } from '../permissions';
import User from '../user';

// TODO: constants
const googleConfigId = 'unleash.enterprise.auth.google';
const samlConfigId = 'unleash.enterprise.auth.saml';

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

    // TODO: does not feel like the right place for this..
    // TODO: only relevant for enterprise-authentication...
    public async generateAuthResponse(): Promise<AuthenticationRequired> {
        const { baseUriPath } = this.config;
        const googleConfig = await this.settingStore.get(googleConfigId);
        const options = [];
        if (googleConfig && googleConfig.enabled) {
            options.push({
                type: 'google',
                value: 'Sign in with Google',
                path: `${baseUriPath}/auth/google/login`,
            });
        }
        const samlConfig = await this.settingStore.get(samlConfigId);
        if (samlConfig && samlConfig.enabled) {
            options.push({
                type: 'saml',
                value: 'Sign in with SAML 2.0',
                path: `${baseUriPath}/auth/saml/login`,
            });
        }
        return new AuthenticationRequired({
            type: 'password',
            path: `${baseUriPath}/auth/simple/login`,
            message: 'You must sign in order to use Unleash',
            options,
        });
    }

    private generateSecretKey() {
        return crypto.randomBytes(32).toString('hex');
    }
}
