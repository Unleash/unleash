import crypto from 'crypto';
import { Logger } from '../logger';
import { ADMIN, CLIENT, FRONTEND } from '../types/permissions';
import { IEventStore, IUnleashStores } from '../types/stores';
import { IUnleashConfig } from '../types/option';
import ApiUser from '../types/api-user';
import {
    ApiTokenType,
    IApiToken,
    ILegacyApiTokenCreate,
    IApiTokenCreate,
    validateApiToken,
    validateApiTokenEnvironment,
    mapLegacyToken,
    mapLegacyTokenWithSecret,
} from '../types/models/api-token';
import { IApiTokenStore } from '../types/stores/api-token-store';
import { FOREIGN_KEY_VIOLATION } from '../error/db-error';
import BadDataError from '../error/bad-data-error';
import { IEnvironmentStore } from 'lib/types/stores/environment-store';
import { constantTimeCompare } from '../util/constantTimeCompare';
import {
    ApiTokenCreatedEvent,
    ApiTokenDeletedEvent,
    ApiTokenUpdatedEvent,
} from '../types';
import { omitKeys } from '../util';

const resolveTokenPermissions = (tokenType: string) => {
    if (tokenType === ApiTokenType.ADMIN) {
        return [ADMIN];
    }

    if (tokenType === ApiTokenType.CLIENT) {
        return [CLIENT];
    }

    if (tokenType === ApiTokenType.FRONTEND) {
        return [FRONTEND];
    }

    return [];
};

export class ApiTokenService {
    private store: IApiTokenStore;

    private environmentStore: IEnvironmentStore;

    private logger: Logger;

    private activeTokens: IApiToken[] = [];

    private eventStore: IEventStore;

    private lastSeenSecrets: Set<string> = new Set<string>();

    constructor(
        {
            apiTokenStore,
            environmentStore,
            eventStore,
        }: Pick<
            IUnleashStores,
            'apiTokenStore' | 'environmentStore' | 'eventStore'
        >,
        config: Pick<IUnleashConfig, 'getLogger' | 'authentication'>,
    ) {
        this.store = apiTokenStore;
        this.eventStore = eventStore;
        this.environmentStore = environmentStore;
        this.logger = config.getLogger('/services/api-token-service.ts');
        this.fetchActiveTokens();
        this.updateLastSeen();
        if (config.authentication.initApiTokens.length > 0) {
            process.nextTick(async () =>
                this.initApiTokens(config.authentication.initApiTokens),
            );
        }
    }

    async fetchActiveTokens(): Promise<void> {
        try {
            this.activeTokens = await this.getAllActiveTokens();
        } finally {
            // eslint-disable-next-line no-unsafe-finally
            return;
        }
    }

    async getToken(secret: string): Promise<IApiToken> {
        return this.store.get(secret);
    }

    async updateLastSeen(): Promise<void> {
        if (this.lastSeenSecrets.size > 0) {
            const toStore = [...this.lastSeenSecrets];
            this.lastSeenSecrets = new Set<string>();
            await this.store.markSeenAt(toStore);
        }
    }

    public async getAllTokens(): Promise<IApiToken[]> {
        return this.store.getAll();
    }

    public async getAllActiveTokens(): Promise<IApiToken[]> {
        return this.store.getAllActive();
    }

    private async initApiTokens(tokens: ILegacyApiTokenCreate[]) {
        const tokenCount = await this.store.count();
        if (tokenCount > 0) {
            return;
        }
        try {
            const createAll = tokens
                .map(mapLegacyTokenWithSecret)
                .map((t) => this.insertNewApiToken(t, 'init-api-tokens'));
            await Promise.all(createAll);
        } catch (e) {
            this.logger.error('Unable to create initial Admin API tokens');
        }
    }

    public getUserForToken(secret: string): ApiUser | undefined {
        if (!secret) {
            return undefined;
        }

        let token = this.activeTokens.find(
            (activeToken) =>
                Boolean(activeToken.secret) &&
                constantTimeCompare(activeToken.secret, secret),
        );

        // If the token is not found, try to find it in the legacy format with alias.
        // This allows us to support the old format of tokens migrating to the embedded proxy.
        if (!token) {
            token = this.activeTokens.find(
                (activeToken) =>
                    Boolean(activeToken.alias) &&
                    constantTimeCompare(activeToken.alias, secret),
            );
        }

        if (token) {
            this.lastSeenSecrets.add(token.secret);

            return new ApiUser({
                tokenName: token.tokenName,
                permissions: resolveTokenPermissions(token.type),
                projects: token.projects,
                environment: token.environment,
                type: token.type,
                secret: token.secret,
            });
        }

        return undefined;
    }

    public async updateExpiry(
        secret: string,
        expiresAt: Date,
        updatedBy: string,
    ): Promise<IApiToken> {
        const previous = await this.store.get(secret);
        const token = await this.store.setExpiry(secret, expiresAt);
        await this.eventStore.store(
            new ApiTokenUpdatedEvent({
                createdBy: updatedBy,
                previousToken: omitKeys(previous, 'secret'),
                apiToken: omitKeys(token, 'secret'),
            }),
        );
        return token;
    }

    public async delete(secret: string, deletedBy: string): Promise<void> {
        if (await this.store.exists(secret)) {
            const token = await this.store.get(secret);
            await this.store.delete(secret);
            await this.eventStore.store(
                new ApiTokenDeletedEvent({
                    createdBy: deletedBy,
                    apiToken: omitKeys(token, 'secret'),
                }),
            );
        }
    }

    /**
     * @deprecated This may be removed in a future release, prefer createApiTokenWithProjects
     */
    public async createApiToken(
        newToken: Omit<ILegacyApiTokenCreate, 'secret'>,
        createdBy: string = 'unleash-system',
    ): Promise<IApiToken> {
        const token = mapLegacyToken(newToken);
        return this.createApiTokenWithProjects(token, createdBy);
    }

    public async createApiTokenWithProjects(
        newToken: Omit<IApiTokenCreate, 'secret'>,
        createdBy: string = 'unleash-system',
    ): Promise<IApiToken> {
        validateApiToken(newToken);
        const environments = await this.environmentStore.getAll();
        validateApiTokenEnvironment(newToken, environments);

        const secret = this.generateSecretKey(newToken);
        const createNewToken = { ...newToken, secret };
        return this.insertNewApiToken(createNewToken, createdBy);
    }

    // TODO: Remove this service method after embedded proxy has been released in
    // 4.16.0
    public async createMigratedProxyApiToken(
        newToken: Omit<IApiTokenCreate, 'secret'>,
    ): Promise<IApiToken> {
        validateApiToken(newToken);

        const secret = this.generateSecretKey(newToken);
        const createNewToken = { ...newToken, secret };
        return this.insertNewApiToken(createNewToken, 'system-migration');
    }

    private async insertNewApiToken(
        newApiToken: IApiTokenCreate,
        createdBy: string,
    ): Promise<IApiToken> {
        try {
            const token = await this.store.insert(newApiToken);
            this.activeTokens.push(token);
            await this.eventStore.store(
                new ApiTokenCreatedEvent({
                    createdBy,
                    apiToken: omitKeys(token, 'secret'),
                }),
            );
            return token;
        } catch (error) {
            if (error.code === FOREIGN_KEY_VIOLATION) {
                let { message } = error;
                if (error.constraint === 'api_token_project_project_fkey') {
                    message = `Project=${this.findInvalidProject(
                        error.detail,
                        newApiToken.projects,
                    )} does not exist`;
                } else if (error.constraint === 'api_tokens_environment_fkey') {
                    message = `Environment=${newApiToken.environment} does not exist`;
                }
                throw new BadDataError(message);
            }
            throw error;
        }
    }

    private findInvalidProject(errorDetails, projects) {
        if (!errorDetails) {
            return 'invalid';
        }
        let invalidProject = projects.find((project) => {
            return errorDetails.includes(`=(${project})`);
        });
        return invalidProject || 'invalid';
    }

    private generateSecretKey({ projects, environment }) {
        const randomStr = crypto.randomBytes(28).toString('hex');
        if (projects.length > 1) {
            return `[]:${environment}.${randomStr}`;
        } else {
            return `${projects[0]}:${environment}.${randomStr}`;
        }
    }
}
