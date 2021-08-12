import crypto from 'crypto';
import { Logger } from '../logger';
import { ADMIN, CLIENT } from '../types/permissions';
import { IUnleashStores } from '../types/stores';
import { IUnleashConfig } from '../types/option';
import ApiUser from '../types/api-user';
import {
    ApiTokenType,
    IApiToken,
    IApiTokenStore,
} from '../types/stores/api-token-store';

const ONE_MINUTE = 60_000;

interface CreateTokenRequest {
    username: string;
    type: ApiTokenType;
    expiresAt?: Date;
}

export class ApiTokenService {
    private store: IApiTokenStore;

    private logger: Logger;

    private timer: NodeJS.Timeout;

    private activeTokens: IApiToken[] = [];

    constructor(
        { apiTokenStore }: Pick<IUnleashStores, 'apiTokenStore'>,
        config: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.store = apiTokenStore;
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

    public getUserForToken(secret: string): ApiUser | undefined {
        const token = this.activeTokens.find((t) => t.secret === secret);
        if (token) {
            const permissions =
                token.type === ApiTokenType.ADMIN ? [ADMIN] : [CLIENT];

            return new ApiUser({
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

    destroy(): void {
        clearInterval(this.timer);
        this.timer = null;
    }
}
