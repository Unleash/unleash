import crypto from 'crypto';
import type { Logger } from '../logger.js';
import { ADMIN, CLIENT, FRONTEND } from '../types/permissions.js';
import type { IUnleashStores } from '../types/stores.js';
import type { IUnleashConfig } from '../types/option.js';
import ApiUser, { type IApiUser } from '../types/api-user.js';
import {
    ALL,
    resolveValidProjects,
    validateApiToken,
} from '../types/models/api-token.js';
import type { IApiTokenStore } from '../types/stores/api-token-store.js';
import { FOREIGN_KEY_VIOLATION } from '../error/db-error.js';
import BadDataError from '../error/bad-data-error.js';
import type { IEnvironmentStore } from '../features/project-environments/environment-store-type.js';
import {
    ADMIN_TOKEN_USER,
    ApiTokenCreatedEvent,
    ApiTokenDeletedEvent,
    ApiTokenType,
    ApiTokenUpdatedEvent,
    type IApiToken,
    type IApiTokenCreate,
    type IAuditUser,
    type IFlagResolver,
    SYSTEM_USER_AUDIT,
} from '../types/index.js';
import { omitKeys } from '../util/index.js';
import type EventService from '../features/events/event-service.js';
import { isPast } from 'date-fns';
import { throwExceedsLimitError } from '../error/exceeds-limit-error.js';
import type EventEmitter from 'events';
import type { ResourceLimitsService } from '../features/resource-limits/resource-limits-service.js';
import {
    createTokenCache,
    type TokenCacheInterface,
} from '../features/apitokencache/api-token-cache.js';

const TOKEN_CACHE_NAME = 'plain-text-tokens-cache' as const;

export interface ApiTokenAuthenticationContext {
    applicationName?: string;
}

const _mask = (secret: string): string => {
    const dot = secret.indexOf('.');
    return dot === -1 ? '<unparseable>' : `${secret.slice(0, dot + 9)}...`;
};

const resolveTokenPermissions = (tokenType: string) => {
    if (tokenType === ApiTokenType.ADMIN) {
        return [ADMIN];
    }

    if (
        tokenType === ApiTokenType.BACKEND ||
        tokenType === ApiTokenType.CLIENT
    ) {
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

    private tokensBySecret: TokenCacheInterface<IApiToken>;

    private tokensByAlias: TokenCacheInterface<IApiToken>;

    private warnedAliasTokens = new Set<string>();

    private eventService: EventService;

    private lastSeenSecrets: Set<string> = new Set<string>();

    private flagResolver: IFlagResolver;

    private resourceLimitsService: ResourceLimitsService;

    private eventBus: EventEmitter;

    constructor(
        {
            apiTokenStore,
            environmentStore,
        }: Pick<IUnleashStores, 'apiTokenStore' | 'environmentStore'>,
        config: Pick<
            IUnleashConfig,
            'getLogger' | 'authentication' | 'flagResolver' | 'eventBus'
        >,
        eventService: EventService,
        resourceLimitsService: ResourceLimitsService,
    ) {
        this.store = apiTokenStore;
        this.eventService = eventService;
        this.resourceLimitsService = resourceLimitsService;
        this.environmentStore = environmentStore;
        this.flagResolver = config.flagResolver;
        this.logger = config.getLogger('/services/api-token-service.ts');

        // Assigned before fetchActiveTokens() below, which now emits on it.
        this.eventBus = config.eventBus;

        this.tokensBySecret = createTokenCache<IApiToken>(TOKEN_CACHE_NAME, {
            flagResolver: this.flagResolver,
            eventBus: this.eventBus,
            logger: this.logger,
        });

        // Deprecated aliases come from the embedded-proxy migration. The
        // store lookup is indexed by token.secret, so aliases cannot use the
        // normal read-through loader and must be kept in a separate index
        // rebuilt from the complete active-token set.
        this.tokensByAlias = createTokenCache<IApiToken>(
            `${TOKEN_CACHE_NAME}-by-alias`,
            {
                flagResolver: this.flagResolver,
                eventBus: this.eventBus,
                logger: this.logger,
            },
        );
    }

    /**
     * Called by a scheduler without jitter to refresh all active tokens
     */
    async fetchActiveTokens(): Promise<void> {
        try {
            this.replaceActiveTokens(await this.store.getAllActive());
        } catch (e) {
            // This refresh is what bounds how long a revoked token keeps
            // working. The scheduler logs job failures, but v1 and v2 share one
            // job id, so name the cache here.
            this.logger.error(
                `Failed to refresh cache ${TOKEN_CACHE_NAME}; it is now serving stale tokens until the next successful refresh`,
                e,
            );
        }
    }

    /** Warm the caches from the store. */
    private replaceActiveTokens(activeTokens: IApiToken[]): void {
        const bySecret = new Map<string, IApiToken>();
        const byAlias = new Map<string, IApiToken>();

        activeTokens.forEach((token) => {
            if (token.secret) {
                bySecret.set(token.secret, token);
            }

            if (token.alias) {
                // the alias is rebuilt wholesale - no other source
                byAlias.set(token.alias, token);
            }
        });

        this.tokensBySecret.setEntries(Array.from(bySecret.entries()));
        this.tokensByAlias.setEntries(Array.from(byAlias.entries()));
    }

    private cacheActiveToken(token: IApiToken): void {
        if (token.secret) {
            this.tokensBySecret.set(token.secret, token);
        }
        if (token.alias) {
            this.tokensByAlias.set(token.alias, token);
        }
    }

    private hasExpired(token?: IApiToken): boolean {
        return Boolean(token?.expiresAt && isPast(token.expiresAt));
    }

    private warnAliasUsage(
        token: IApiToken,
        context: ApiTokenAuthenticationContext,
    ): void {
        // Warn once per token, not per request: an alias in active use would
        // otherwise flood the log
        // Keyed by alias too: two tokens can share a name and environment, and
        // each deprecated alias is worth its own warning. In-memory only.
        const key = `${token.tokenName}:${token.environment}:${token.alias}`;
        if (this.warnedAliasTokens.has(key)) {
            return;
        }

        this.warnedAliasTokens.add(key);
        this.logger.warn(
            `API token "${token.tokenName}" (environment: ${token.environment}, application: ${context?.applicationName ?? 'unknown'}, created: ${token.createdAt.toISOString()}) was resolved through the deprecated alias column during authentication. It should be rotated before alias support is removed.`,
        );
    }

    async getToken(secret: string): Promise<IApiToken | undefined> {
        return this.store.get(secret);
    }

    async getTokenWithCache(
        secret: string,
        context: ApiTokenAuthenticationContext = {},
    ): Promise<IApiToken | undefined> {
        if (!secret) {
            return undefined;
        }

        let token = await this.tokensBySecret.get(secret, (key) => {
            return this.getToken(key);
        });
        if (token && !this.hasExpired(token)) {
            return token;
        }
        token = await this.tokensByAlias.get(secret, async (_key) => undefined);
        if (token && !this.hasExpired(token)) {
            this.warnAliasUsage(token, context);
            return token;
        }

        if (!token || this.hasExpired(token)) {
            return undefined;
        }
        return token;
    }

    async updateLastSeen(): Promise<void> {
        if (this.lastSeenSecrets.size > 0) {
            const toStore = [...this.lastSeenSecrets];
            this.lastSeenSecrets = new Set<string>();
            await this.store.markSeenAt(toStore);
        }
    }

    public async markSeenByTokens(tokens: string[]): Promise<void> {
        tokens.forEach((token) => {
            this.lastSeenSecrets.add(token);
        });
    }

    public async getAllTokens(): Promise<IApiToken[]> {
        return this.store.getAll();
    }

    public async getUserDefinedTokens(): Promise<IApiToken[]> {
        return this.store.getUserDefinedTokens();
    }

    async initApiTokens(tokens: IApiTokenCreate[]) {
        const tokenCount = await this.store.count();
        if (tokenCount > 0) {
            this.logger.debug(
                'Not creating initial API tokens because tokens exist in the database',
            );
            return;
        }
        try {
            const createAll = tokens.map((t) =>
                this.insertNewApiToken(t, SYSTEM_USER_AUDIT),
            );
            await Promise.all(createAll);
            this.logger.info(
                `Created initial API tokens: ${tokens.map((t) => `(name: ${t.tokenName}, type: ${t.type})`).join(', ')}`,
            );
        } catch (e) {
            this.logger.warn(
                `Unable to create initial API tokens from: ${tokens.map((t) => `(name: ${t.tokenName}, type: ${t.type})`).join(', ')}`,
                e,
            );
        }
    }

    public async getUserForToken(
        secret: string,
        context: ApiTokenAuthenticationContext = {},
    ): Promise<IApiUser | undefined> {
        const token = await this.getTokenWithCache(secret, context);
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
        auditUser: IAuditUser,
    ): Promise<IApiToken> {
        const previous = (await this.store.get(secret))!;
        const token = (await this.store.setExpiry(secret, expiresAt))!;
        await this.eventService.storeEvent(
            new ApiTokenUpdatedEvent({
                auditUser,
                previousToken: omitKeys(previous, 'secret'),
                apiToken: omitKeys(token, 'secret'),
            }),
        );
        return token;
    }

    public async delete(secret: string, auditUser: IAuditUser): Promise<void> {
        if (await this.store.exists(secret)) {
            const token = (await this.store.get(secret))!;
            await this.store.delete(secret);
            await this.eventService.storeEvent(
                new ApiTokenDeletedEvent({
                    auditUser,
                    apiToken: omitKeys(token, 'secret'),
                }),
            );
        }
    }

    /**
     * @param newToken
     * @param auditUser Used for event log and referencing who made the token
     */
    public async createApiTokenWithProjects(
        newToken: Omit<IApiTokenCreate, 'secret'>,
        auditUser: IAuditUser = SYSTEM_USER_AUDIT,
    ): Promise<IApiToken> {
        return this.internalCreateApiTokenWithProjects(
            {
                ...newToken,
                projects: resolveValidProjects(newToken.projects),
            },
            auditUser,
        );
    }

    private async internalCreateApiTokenWithProjects(
        newToken: Omit<IApiTokenCreate, 'secret'>,
        auditUser: IAuditUser,
    ): Promise<IApiToken> {
        validateApiToken(newToken);
        await this.validateApiTokenEnvironment(newToken);
        await this.validateApiTokenLimit();

        const secret = this.generateSecretKey(newToken);
        const createNewToken = { ...newToken, secret };
        return this.insertNewApiToken(createNewToken, auditUser);
    }

    private async validateApiTokenEnvironment({
        environment,
    }: Pick<IApiTokenCreate, 'environment'>): Promise<void> {
        if (environment === ALL) {
            return;
        }

        const exists = await this.environmentStore.exists(environment);
        if (!exists) {
            throw new BadDataError(`Environment=${environment} does not exist`);
        }
    }

    private async validateApiTokenLimit() {
        const currentTokenCount = await this.store.count();
        const { apiTokens: limit } =
            await this.resourceLimitsService.getResourceLimits();
        if (currentTokenCount >= limit) {
            throwExceedsLimitError(this.eventBus, {
                resource: 'api token',
                limit,
            });
        }
    }

    // TODO: Remove this service method after embedded proxy has been released in
    // 4.16.0
    public async createMigratedProxyApiToken(
        newToken: Omit<IApiTokenCreate, 'secret'>,
    ): Promise<IApiToken> {
        validateApiToken(newToken);

        const secret = this.generateSecretKey(newToken);
        const createNewToken = { ...newToken, secret };
        return this.insertNewApiToken(createNewToken, SYSTEM_USER_AUDIT);
    }

    private normalizeTokenType(token: IApiTokenCreate): IApiTokenCreate {
        const { type, ...rest } = token;
        return {
            ...rest,
            type: type.toLowerCase() as ApiTokenType,
        };
    }

    private async insertNewApiToken(
        newApiToken: IApiTokenCreate,
        auditUser: IAuditUser,
    ): Promise<IApiToken> {
        try {
            const token = await this.store.insert(
                this.normalizeTokenType(newApiToken),
                auditUser.id,
            );
            this.cacheActiveToken(token);
            await this.eventService.storeEvent(
                new ApiTokenCreatedEvent({
                    auditUser,
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
