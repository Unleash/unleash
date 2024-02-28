import crypto from 'crypto';
import { Logger } from '../logger';
import { ADMIN, CLIENT, FRONTEND } from '../types/permissions';
import { IUnleashStores } from '../types/stores';
import { IUnleashConfig } from '../types/option';
import ApiUser, { IApiUser } from '../types/api-user';
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
import { IEnvironmentStore } from '../features/project-environments/environment-store-type';
import { constantTimeCompare } from '../util/constantTimeCompare';
import {
    ADMIN_TOKEN_USER,
    ApiTokenCreatedEvent,
    ApiTokenDeletedEvent,
    ApiTokenUpdatedEvent,
    IFlagContext,
    IFlagResolver,
    IUser,
    SYSTEM_USER,
    SYSTEM_USER_ID,
} from '../types';
import {
    extractUserIdFromUser,
    extractUsernameFromUser,
    omitKeys,
} from '../util';
import EventService from '../features/events/event-service';

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

    private initialized = false;

    private eventService: EventService;

    private lastSeenSecrets: Set<string> = new Set<string>();

    private flagResolver: IFlagResolver;

    constructor(
        {
            apiTokenStore,
            environmentStore,
        }: Pick<IUnleashStores, 'apiTokenStore' | 'environmentStore'>,
        config: Pick<
            IUnleashConfig,
            'getLogger' | 'authentication' | 'flagResolver'
        >,
        eventService: EventService,
    ) {
        this.store = apiTokenStore;
        this.eventService = eventService;
        this.environmentStore = environmentStore;
        this.flagResolver = config.flagResolver;
        this.logger = config.getLogger('/services/api-token-service.ts');
        if (!this.flagResolver.isEnabled('useMemoizedActiveTokens')) {
            // This is probably not needed because the scheduler will run it
            this.fetchActiveTokens();
        }
        this.updateLastSeen();
        if (config.authentication.initApiTokens.length > 0) {
            process.nextTick(async () =>
                this.initApiTokens(config.authentication.initApiTokens),
            );
        }
    }

    /**
     * Executed by a scheduler to refresh all active tokens
     */
    async fetchActiveTokens(): Promise<void> {
        try {
            this.activeTokens = await this.store.getAllActive();
            this.initialized = true;
        } finally {
            // biome-ignore lint/correctness/noUnsafeFinally: We ignored this for eslint. Leaving this here for now, server-impl test fails without it
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
        if (this.flagResolver.isEnabled('useMemoizedActiveTokens')) {
            if (!this.initialized) {
                // unlikely this will happen but nice to have a fail safe
                this.logger.info('Fetching active tokens before initialized');
                await this.fetchActiveTokens();
            }
            return this.activeTokens;
        } else {
            return this.store.getAllActive();
        }
    }

    private async initApiTokens(tokens: ILegacyApiTokenCreate[]) {
        const tokenCount = await this.store.count();
        if (tokenCount > 0) {
            return;
        }
        try {
            const createAll = tokens
                .map(mapLegacyTokenWithSecret)
                .map((t) =>
                    this.insertNewApiToken(
                        t,
                        'init-api-tokens',
                        SYSTEM_USER_ID,
                    ),
                );
            await Promise.all(createAll);
        } catch (e) {
            this.logger.error('Unable to create initial Admin API tokens');
        }
    }

    public async getUserForToken(
        secret: string,
        flagContext?: IFlagContext, // temporarily added, expected from the middleware
    ): Promise<IApiUser | undefined> {
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
                    constantTimeCompare(activeToken.alias!, secret),
            );
        }

        if (
            !token &&
            this.flagResolver.isEnabled('queryMissingTokens', flagContext)
        ) {
            token = await this.store.get(secret);
            if (token) {
                this.activeTokens.push(token);
            }
        }

        if (token) {
            this.lastSeenSecrets.add(token.secret);
            const apiUser: IApiUser = new ApiUser({
                tokenName: token.tokenName,
                permissions: resolveTokenPermissions(token.type),
                projects: token.projects,
                environment: token.environment,
                type: token.type,
                secret: token.secret,
            });

            apiUser.internalAdminTokenUserId =
                token.type === ApiTokenType.ADMIN
                    ? ADMIN_TOKEN_USER.id
                    : undefined;
            return apiUser;
        }

        return undefined;
    }

    public async updateExpiry(
        secret: string,
        expiresAt: Date,
        updatedBy: string,
        updatedById: number,
    ): Promise<IApiToken> {
        const previous = await this.store.get(secret);
        const token = await this.store.setExpiry(secret, expiresAt);
        await this.eventService.storeEvent(
            new ApiTokenUpdatedEvent({
                createdBy: updatedBy,
                createdByUserId: updatedById,
                previousToken: omitKeys(previous, 'secret'),
                apiToken: omitKeys(token, 'secret'),
            }),
        );
        return token;
    }

    public async delete(
        secret: string,
        deletedBy: string,
        deletedByUserId: number,
    ): Promise<void> {
        if (await this.store.exists(secret)) {
            const token = await this.store.get(secret);
            await this.store.delete(secret);
            await this.eventService.storeEvent(
                new ApiTokenDeletedEvent({
                    createdBy: deletedBy,
                    createdByUserId: deletedByUserId,
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
        createdBy: string = SYSTEM_USER.username,
        createdByUserId: number = SYSTEM_USER.id,
    ): Promise<IApiToken> {
        const token = mapLegacyToken(newToken);
        return this.internalCreateApiTokenWithProjects(
            token,
            createdBy,
            createdByUserId,
        );
    }

    /**
     * @param newToken
     * @param createdBy should be IApiUser or IUser. Still supports optional or string for backward compatibility
     * @param createdByUserId still supported for backward compatibility
     */
    public async createApiTokenWithProjects(
        newToken: Omit<IApiTokenCreate, 'secret'>,
        createdBy?: string | IApiUser | IUser,
        createdByUserId?: number,
    ): Promise<IApiToken> {
        // if statement to support old method signature
        if (
            createdBy === undefined ||
            typeof createdBy === 'string' ||
            createdByUserId
        ) {
            return this.internalCreateApiTokenWithProjects(
                newToken,
                (createdBy as string) || SYSTEM_USER.username,
                createdByUserId || SYSTEM_USER.id,
            );
        }
        return this.internalCreateApiTokenWithProjects(
            newToken,
            extractUsernameFromUser(createdBy),
            extractUserIdFromUser(createdBy),
        );
    }

    private async internalCreateApiTokenWithProjects(
        newToken: Omit<IApiTokenCreate, 'secret'>,
        createdBy: string,
        createdByUserId: number,
    ): Promise<IApiToken> {
        validateApiToken(newToken);
        const environments = await this.environmentStore.getAll();
        validateApiTokenEnvironment(newToken, environments);

        const secret = this.generateSecretKey(newToken);
        const createNewToken = { ...newToken, secret };
        return this.insertNewApiToken(
            createNewToken,
            createdBy,
            createdByUserId,
        );
    }

    // TODO: Remove this service method after embedded proxy has been released in
    // 4.16.0
    public async createMigratedProxyApiToken(
        newToken: Omit<IApiTokenCreate, 'secret'>,
    ): Promise<IApiToken> {
        validateApiToken(newToken);

        const secret = this.generateSecretKey(newToken);
        const createNewToken = { ...newToken, secret };
        return this.insertNewApiToken(
            createNewToken,
            'system-migration',
            SYSTEM_USER_ID,
        );
    }

    private async insertNewApiToken(
        newApiToken: IApiTokenCreate,
        createdBy: string,
        createdByUserId: number,
    ): Promise<IApiToken> {
        try {
            const token = await this.store.insert(newApiToken);
            this.activeTokens.push(token);
            await this.eventService.storeEvent(
                new ApiTokenCreatedEvent({
                    createdBy,
                    createdByUserId,
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
        const invalidProject = projects.find((project) => {
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
