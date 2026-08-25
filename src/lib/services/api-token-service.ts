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
import { addMinutes, isPast } from 'date-fns';
import metricsHelper from '../util/metrics-helper.js';
import {
    FUNCTION_TIME,
    TOKEN_CACHE_LOOKUP,
    emitMetricEvent,
    type TokenLookupResult,
} from '../metric-events.js';
import { throwExceedsLimitError } from '../error/exceeds-limit-error.js';
import type EventEmitter from 'events';
import type { ResourceLimitsService } from '../features/resource-limits/resource-limits-service.js';

const TOKEN_CACHE_NAME = 'api-token-v1' as const;

export interface ApiTokenAuthenticationContext {
    applicationName?: string;
}

/**
 * `default:development.a1b2c3d4...` - enough to identify, not enough to use.
 * The input is whatever the client sent, so anything unparseable is dropped
 * rather than echoed into the log.
 */
const mask = (secret: string): string => {
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

    private tokensBySecret = new Map<string, IApiToken>(); // holds every token once
    private tokensByAlias = new Map<string, IApiToken>();

    private queryAfter = new Map<string, Date>();

    private warnedAliasTokens = new Set<string>();

    private eventService: EventService;

    private lastSeenSecrets: Set<string> = new Set<string>();

    private flagResolver: IFlagResolver;

    private timer: Function;

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

        if (!this.flagResolver.isEnabled('useMemoizedActiveTokens')) {
            // This is probably not needed because the scheduler will run it
            this.fetchActiveTokens();
        }
        this.updateLastSeen();
        this.timer = (functionName: string) =>
            metricsHelper.wrapTimer(config.eventBus, FUNCTION_TIME, {
                className: 'ApiTokenService',
                functionName,
            });
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

    /** Swap the whole set. */
    private replaceActiveTokens(tokens: IApiToken[]): void {
        const bySecret = new Map<string, IApiToken>();
        const byAlias = new Map<string, IApiToken>();

        tokens.forEach((token) => {
            if (token.secret) {
                bySecret.set(token.secret, token);
            }
            if (token.alias) {
                byAlias.set(token.alias, token);
            }
        });

        this.tokensBySecret = bySecret;
        this.tokensByAlias = byAlias;
    }

    private cacheActiveToken(token: IApiToken): void {
        if (token.secret) {
            this.tokensBySecret.set(token.secret, token);
        }
        if (token.alias) {
            this.tokensByAlias.set(token.alias, token);
        }
    }

    private findCachedToken(secret: string): IApiToken | undefined {
        const bySecret = this.tokensBySecret.get(secret);
        if (bySecret) {
            // recheck if token is active (could have expired inside the window)
            return this.ifActive(bySecret);
        }

        // check if any aliases - coming from the embedded-proxy migration
        // aliases are unqueryable - on token.secret the filters
        const byAlias = this.tokensByAlias.get(secret);
        if (!byAlias) {
            return undefined;
        }

        return this.ifActive(byAlias);
    }

    private ifActive(token?: IApiToken): IApiToken | undefined {
        return token?.expiresAt && isPast(token.expiresAt) ? undefined : token;
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
            `API token "${token.tokenName}" (environment: ${token.environment}, application: ${context.applicationName ?? 'unknown'}, created: ${token.createdAt.toISOString()}) was resolved through the deprecated alias column during authentication. It should be rotated before alias support is removed.`,
        );
    }

    async getToken(secret: string): Promise<IApiToken | undefined> {
        return this.store.get(secret);
    }

    async getTokenWithCache(secret: string): Promise<IApiToken | undefined> {
        if (!secret) {
            return undefined;
        }

        let result: TokenLookupResult = 'miss';
        let token = this.findCachedToken(secret);

        if (token) {
            result = 'hit';
        } else if (this.isThrottled(secret)) {
            // store has recently rejected the secret
            // query was suppressed by the negative cache
            result = 'throttled';
        } else {
            // read-through for a secret the cache does not have yet
            token = await this.queryToken(secret);
        }

        emitMetricEvent(this.eventBus, TOKEN_CACHE_LOOKUP, {
            cache: TOKEN_CACHE_NAME,
            result,
        });
        return token;
    }

    private isThrottled(secret: string): boolean {
        const nextAllowedQuery = this.queryAfter.get(secret);
        if (!nextAllowedQuery || isPast(nextAllowedQuery)) {
            return false;
        }

        // a client looping on a bad token would flood the log
        if (Math.random() < 0.1) {
            this.logger.info(
                `Token ${mask(secret)} rate limited until: ${nextAllowedQuery}`,
            );
        }
        return true;
    }

    private async queryToken(secret: string): Promise<IApiToken | undefined> {
        if (this.queryAfter.size > 1000) {
            this.logger.warn(
                `${TOKEN_CACHE_NAME}: negative lookup cache reached 1000 entries and was cleared.`,
            );
            // TODO: clearing loses all rate-limiting. Maybe FIFO eviction with a hard limit?
            this.queryAfter.clear();
        }

        const stopCacheTimer = this.timer('getTokenWithCache.query');
        try {
            const found = await this.store.get(secret);
            const activeToken = this.ifActive(found);

            if (found && !activeToken) {
                this.logger.info('Token has expired');
            }

            if (activeToken) {
                this.cacheActiveToken(activeToken);
                return activeToken;
            }

            // Don't re-query an invalid or expired secret for 5 minutes.
            this.queryAfter.set(secret, addMinutes(new Date(), 5));

            return undefined;
        } finally {
            stopCacheTimer();
        }
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
        const token = await this.getTokenWithCache(secret);
        if (token) {
            if (token.alias === secret) {
                this.warnAliasUsage(token, context);
            }
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
