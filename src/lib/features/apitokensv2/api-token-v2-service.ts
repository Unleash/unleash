import { isAfter, isPast, subHours } from 'date-fns';
import ApiUser, { type IApiUser } from '../../types/api-user.js';
import { ApiTokenType, type IApiToken } from '../../types/model.js';
import {
    ApiTokenCreatedEvent,
    ApiTokenDeletedEvent,
    ApiTokenUpdatedEvent,
} from '../../types/events.js';
import type { IAuditUser } from '../../types/user.js';
import { ADMIN, CLIENT, FRONTEND } from '../../types/permissions.js';
import type {
    ApiTokenV2,
    ApiTokenV2WithVerifier,
    ApiTokenV2WithSecret,
    CreateApiTokenV2,
    IApiTokenV2Store,
} from './api-token-v2-types.js';
import type EventService from '../events/event-service.js';
import { omitKeys } from '../../util/index.js';
import { BadDataError, throwExceedsLimitError } from '../../error/index.js';
import {
    type IEnvironmentStore,
    type IUnleashConfig,
    type IUnleashStores,
    SYSTEM_USER_AUDIT,
} from '../../types/index.js';
import {
    type IUnleashServices,
    ResourceLimitsService,
} from '../../services/index.js';
import {
    resolveValidProjects,
    validateApiToken,
} from '../../types/models/api-token.js';
import type EventEmitter from 'events';
import type { Db } from '../../db/db.js';
import type { IEventStore } from '../../types/stores/event-store.js';
import { EventStore } from '../events/event-store.js';
import { API_TOKEN_DELETED, API_TOKEN_UPDATED } from '../../events/index.js';
import { ApiTokenV2Store } from './api-token-v2-store.js';
import EnvironmentStore from '../project-environments/environment-store.js';
import { FakeApiTokenV2Store } from './fake-api-token-v2-store.js';
import FakeEnvironmentStore from '../project-environments/fake-environment-store.js';
import {
    createEventsService,
    createFakeEventsService,
    type EdgeEnvironmentsProjectsListSchema,
    type EdgeTokenSchema,
    type Logger,
} from '../../server-impl.js';
import FakeEventStore from '../../../test/fixtures/fake-event-store.js';
import FakeFeatureTagStore from '../../../test/fixtures/fake-feature-tag-store.js';
import metricsHelper from '../../util/metrics-helper.js';
import { FUNCTION_TIME } from '../../metric-events.js';
import {
    AuthorizationTokenKind,
    createTokenV2Credential,
    type ApiTokenV2Credential,
    type ApiTokenV2Identifier,
} from '../../authentication/authorization-token.js';
import { verifyToken } from '../../authentication/token-verifier.js';
import {
    createTokenCache,
    type TokenCacheInterface,
} from '../apitokencache/api-token-cache.js';

const SYSTEM_TOKEN_LIFETIME_AFTER_LAST_SEEN_IN_MINUTES = 7 * 24 * 60;
const TOKEN_CACHE_WARMUP_SEEN_WITHIN_HOURS = 6;
const TOKEN_CACHE_NAME = 'secure-tokens-cache' as const;

const resolveTokenPermissions = (tokenType: ApiTokenType) => {
    if (tokenType === ApiTokenType.ADMIN) {
        return [ADMIN];
    }
    if (
        tokenType === ApiTokenType.BACKEND ||
        tokenType === ApiTokenType.CLIENT
    ) {
        return [CLIENT];
    }
    return tokenType === ApiTokenType.FRONTEND ? [FRONTEND] : [];
};

export const createApiTokenV2Service = (
    config: IUnleashConfig,
): ((db: Db) => ReadOnlyApiTokenV2Service & AdminApiTokenV2Service) => {
    return (db: Db) =>
        new ApiTokenV2Service(
            {
                apiTokenV2Store: new ApiTokenV2Store(db),
                environmentStore: new EnvironmentStore(
                    db,
                    config.eventBus,
                    config,
                ),
                eventStore: new EventStore(db, config.getLogger),
            },
            config,
            {
                eventService: createEventsService(db, config),
                resourceLimitsService: new ResourceLimitsService(config),
            },
        );
};

export const createFakeApiTokenV2Service = (
    config: IUnleashConfig,
    stores?: Partial<IUnleashStores>,
    services?: Partial<IUnleashServices>,
) => {
    const apiTokenV2Store =
        stores?.apiTokenV2Store ?? new FakeApiTokenV2Store();
    const environmentStore =
        stores?.environmentStore ?? new FakeEnvironmentStore();
    const fakeEventStore = stores?.eventStore ?? new FakeEventStore();
    const featureTagStore =
        stores?.featureTagStore ?? new FakeFeatureTagStore();
    const eventService =
        services?.eventService ??
        createFakeEventsService(config, {
            eventStore: fakeEventStore,
            featureTagStore: featureTagStore,
        });
    const resourceLimitsService =
        services?.resourceLimitsService ?? new ResourceLimitsService(config);
    return new ApiTokenV2Service(
        { apiTokenV2Store, environmentStore, eventStore: fakeEventStore },
        config,
        { eventService, resourceLimitsService },
    );
};

export interface ReadOnlyApiTokenV2Service {
    getToken(identifier: ApiTokenV2Identifier): Promise<IApiToken | undefined>;
    getTokenWithCache(
        credential: ApiTokenV2Credential,
    ): Promise<IApiToken | undefined>;
    getUserForToken({
        secret,
        selector,
    }: ApiTokenV2Credential): Promise<IApiUser | undefined>;
    getUserDefinedTokens(): Promise<IApiToken[]>;

    fetchActiveTokens(): Promise<void>;
    initialize(): Promise<void>;
    invalidateCache(selectors: string[]): void;
    pollTokenChanges(): Promise<void>;
}

export interface AdminApiTokenV2Service {
    create(
        token: CreateApiTokenV2,
        auditUser: IAuditUser,
    ): Promise<ApiTokenV2WithSecret>;
    createTokensFromEdgeIssue(
        tokenRequests: EdgeEnvironmentsProjectsListSchema,
    ): Promise<EdgeTokenSchema[]>;
    delete(
        identifier: ApiTokenV2Identifier,
        auditUser: IAuditUser,
    ): Promise<boolean>;
    deleteByEnvironment(
        environment: string,
        auditUser: IAuditUser,
    ): Promise<string[]>;
    deleteSystemCreatedTokensNotSeen(): Promise<Omit<ApiTokenV2, 'projects'>[]>;
    updateExpiry(
        identifier: ApiTokenV2Identifier,
        expiresAt: Date,
        auditUser: IAuditUser,
    ): Promise<IApiToken | undefined>;
}

class ApiTokenV2Service
    implements ReadOnlyApiTokenV2Service, AdminApiTokenV2Service
{
    private apiTokenV2Store: IApiTokenV2Store;
    private eventService: EventService;
    private environmentStore: IEnvironmentStore;
    private resourceLimitsService: ResourceLimitsService;
    private eventBus: EventEmitter;
    private logger: Logger;

    private cache: TokenCacheInterface<ApiTokenV2WithVerifier>;
    private eventStore: IEventStore;

    private tokenRevision = 0;
    private timer: Function;

    constructor(
        {
            apiTokenV2Store,
            environmentStore,
            eventStore,
        }: Pick<
            IUnleashStores,
            'apiTokenV2Store' | 'environmentStore' | 'eventStore'
        >,
        {
            eventBus,
            getLogger,
            flagResolver,
        }: Pick<IUnleashConfig, 'eventBus' | 'getLogger' | 'flagResolver'>,
        {
            eventService,
            resourceLimitsService,
        }: Pick<IUnleashServices, 'eventService' | 'resourceLimitsService'>,
    ) {
        this.apiTokenV2Store = apiTokenV2Store;
        this.eventService = eventService;
        this.environmentStore = environmentStore;
        this.eventStore = eventStore;
        this.resourceLimitsService = resourceLimitsService;
        this.eventBus = eventBus;
        this.logger = getLogger('features/apitokensv2/api-token-v2-service.ts');
        this.cache = createTokenCache<ApiTokenV2WithVerifier>(
            TOKEN_CACHE_NAME,
            { flagResolver, eventBus: this.eventBus, logger: this.logger },
        );
        this.timer = (functionName: string) =>
            metricsHelper.wrapTimer(eventBus, FUNCTION_TIME, {
                className: 'ApiTokenV2Service',
                functionName,
            });
    }

    async initialize(): Promise<void> {
        // initialize token revision to avoid unnecessary cache invalidation on startup
        // because of the read through cache, we don't need to pre-load all tokens, but we still need to know the latest revision
        // to query changes that happened after the last seen token revision, so we can invalidate the cache for those tokens
        this.tokenRevision = await this.eventStore.getMaxTokenRevisionId();

        if (!this.cache.usesReadThroughCache()) {
            return; // only read-through cache needs to be initialized, since it is not pre-loaded with all tokens
        }
        const recentTime = subHours(
            new Date(),
            TOKEN_CACHE_WARMUP_SEEN_WITHIN_HOURS,
        );
        const recentlySeenTokens = (token: ApiTokenV2WithVerifier) =>
            token.seenAt && isAfter(token.seenAt, recentTime);
        const tokens = await this.apiTokenV2Store.getAllActive();
        this.cache.setEntries(
            tokens
                .filter(recentlySeenTokens)
                .map((token) => [token.selector, token]),
        );
    }

    async pollTokenChanges(): Promise<void> {
        if (!this.cache.usesReadThroughCache()) {
            // old cache implementation could reload everything on changes but because
            // it refreshes every minute, I decided to keep that behavior for now.
            return;
        }
        try {
            const revision = await this.eventStore.getMaxTokenRevisionId(
                this.tokenRevision,
            );
            if (revision <= this.tokenRevision) {
                return;
            }

            const events = await this.eventStore.getTokenRevisionRange(
                this.tokenRevision,
                revision,
            );
            for (const event of events) {
                const payload = (
                    event.type === API_TOKEN_DELETED
                        ? event.preData
                        : event.data
                ) as { selector?: unknown; tokenVersion?: unknown } | undefined;
                if (
                    payload?.tokenVersion === 2 &&
                    typeof payload?.selector === 'string' &&
                    (event.type === API_TOKEN_UPDATED ||
                        event.type === API_TOKEN_DELETED)
                ) {
                    // invalidate the cache for this selector, since the token has been updated or deleted
                    // created ones will be read on demand, so no need to pre-load them
                    this.cache.invalidate(payload.selector);
                }
            }
            this.tokenRevision = revision;
        } catch (e) {
            this.logger.error(
                `Failed to poll token changes; the cache ${this.cache.name} may be stale until the next successful refresh`,
                e,
            );
        }
    }

    /**
     * Bulk-load only the legacy cache. The single-flight cache is intentionally
     * read-through: a selector is loaded on demand and its sliding TTL keeps hot
     * tokens resident without re-reading every active token on a fixed schedule.
     * Successful legacy lookups also seed it so a runtime cache switch is warm.
     */
    async fetchActiveTokens(): Promise<void> {
        if (this.cache.usesReadThroughCache()) {
            return; // skip for read through cache
        }
        try {
            const tokens = await this.apiTokenV2Store.getAllActive();
            this.cache.setEntries(
                tokens.map((token) => [token.selector, token]),
            );
        } catch (e) {
            // a refresh is what bounds how long a revoked token keeps working
            // if a pod stops refreshing -> security-relevant condition
            // log it here - the scheduler's job log cannot say if v1 or v2 cache failed
            this.logger.error(
                `Failed to refresh cache ${this.cache.name}; it is now serving stale tokens until the next successful refresh`,
                e,
            );
            // rethrow: unlike v1 this method does not swallow, so the scheduler
            // still sees the failure
            throw e;
        }
    }

    async create(
        token: CreateApiTokenV2,
        auditUser: IAuditUser,
    ): Promise<ApiTokenV2WithSecret> {
        return this.internalCreateApiTokenWithProjects(
            {
                ...token,
                projects: resolveValidProjects(token.projects),
            },
            auditUser,
        );
    }

    async createTokensFromEdgeIssue(
        tokenRequests: EdgeEnvironmentsProjectsListSchema,
    ): Promise<EdgeTokenSchema[]> {
        const tokens: EdgeTokenSchema[] = [];
        for (const tokenReq of tokenRequests.tokens) {
            if (tokenReq.environment && tokenReq.projects) {
                const newToken = await this.create(
                    {
                        environment: tokenReq.environment,
                        projects: tokenReq.projects,
                        tokenName: `enterprise_edge_${tokenReq.environment}_${truncate(tokenReq.projects, 3)}`,
                        type: ApiTokenType.BACKEND,
                        userCreated: false,
                    },
                    SYSTEM_USER_AUDIT,
                );
                tokens.push({
                    token: newToken.secret,
                    environment: newToken.environment,
                    projects: newToken.projects,
                    type: ApiTokenType.BACKEND,
                });
            }
        }
        return tokens;
    }

    private async internalCreateApiTokenWithProjects(
        token: CreateApiTokenV2,
        auditUser: IAuditUser,
    ): Promise<ApiTokenV2WithSecret> {
        validateApiToken(token);
        await this.validateApiTokenEnvironment(token);
        await this.validateApiTokenLimit(token.userCreated);

        const credential = createTokenV2Credential({
            kind:
                token.type === ApiTokenType.ADMIN
                    ? AuthorizationTokenKind.ADMIN_API_TOKEN
                    : AuthorizationTokenKind.API_TOKEN,
            tokenPrefix: `${toProjectPart(token.projects)}:${token.environment}`,
        });
        const created = await this.apiTokenV2Store.create(
            token,
            credential.selector,
            credential.verifier,
        );
        await this.eventService.storeEventsOrThrow([
            new ApiTokenCreatedEvent({
                auditUser,
                apiToken: this.toEventToken(
                    this.toApiToken(created),
                    created.selector,
                ),
            }),
        ]);
        return { ...created, secret: credential.secret };
    }

    private async validateApiTokenLimit(userCreated: boolean) {
        if (!userCreated) {
            return;
        }
        const currentTokenCount =
            await this.apiTokenV2Store.countUserCreatedTokens();
        const { apiTokens: limit } =
            await this.resourceLimitsService.getResourceLimits();
        if (currentTokenCount >= limit) {
            throwExceedsLimitError(this.eventBus, {
                resource: 'api token',
                limit,
            });
        }
    }

    private async validateApiTokenEnvironment({
        environment,
    }: Pick<CreateApiTokenV2, 'environment'>): Promise<void> {
        const exists = await this.environmentStore.exists(environment);
        if (!exists) {
            throw new BadDataError(`Environment=${environment} does not exist`);
        }
    }

    async getToken(
        identifier: ApiTokenV2Identifier,
    ): Promise<IApiToken | undefined> {
        const token = await this.apiTokenV2Store.getBySelector(
            identifier.selector,
        );
        if (!token) {
            return undefined;
        }
        return this.toApiToken(token);
    }

    async getTokenWithCache(
        credential: ApiTokenV2Credential,
    ): Promise<IApiToken | undefined> {
        const verified = await this.findVerifiedToken(credential);
        if (!verified) {
            return undefined;
        }
        return this.toApiToken(verified);
    }

    /**
     * Resolves a credential against the cache, keyed by *selector*
     */
    private async findVerifiedToken(
        credential: ApiTokenV2Credential,
    ): Promise<ApiTokenV2WithVerifier | undefined> {
        const { secret, selector } = credential;
        if (!secret) {
            return undefined;
        }

        const token = await this.cache.get(selector, (key) =>
            this.loadToken(key),
        );

        if (!token || this.hasExpired(token)) {
            return undefined;
        }

        if (!verifyToken(secret, token.verifier)) {
            // the token cache doesn't know about the secret, so a failed verification
            // does not count as a cache miss, but it does mean the token is not valid for this request
            return undefined;
        }

        return token;
    }

    private async loadToken(
        selector: string,
    ): Promise<ApiTokenV2WithVerifier | undefined> {
        const stopTimer = this.timer('getTokenWithCache.query');
        try {
            const token = await this.apiTokenV2Store.getBySelector(selector);
            if (this.hasExpired(token)) {
                return undefined;
            }
            return token;
        } finally {
            stopTimer();
        }
    }

    private hasExpired(token: ApiTokenV2WithVerifier | undefined): boolean {
        return Boolean(token?.expiresAt && isPast(token.expiresAt));
    }

    async getUserDefinedTokens(): Promise<IApiToken[]> {
        const tokens = await this.apiTokenV2Store.getUserDefinedTokens();
        return tokens.map((token) => this.toApiToken(token));
    }

    async updateExpiry(
        identifier: ApiTokenV2Identifier,
        expiresAt: Date,
        auditUser: IAuditUser,
    ): Promise<IApiToken | undefined> {
        const previous = await this.getToken(identifier);
        if (!previous) {
            return undefined;
        }
        const updatedStoreToken = await this.apiTokenV2Store.setExpiry(
            previous.secret,
            expiresAt,
        );
        if (!updatedStoreToken) {
            return undefined;
        }

        const updated = this.toApiToken(updatedStoreToken);
        await this.eventService.storeEventsOrThrow([
            new ApiTokenUpdatedEvent({
                auditUser,
                previousToken: this.toEventToken(previous, previous.secret),
                apiToken: this.toEventToken(updated, previous.secret),
            }),
        ]);
        return updated;
    }

    async delete(
        identifier: ApiTokenV2Identifier,
        auditUser: IAuditUser,
    ): Promise<boolean> {
        const token = await this.getToken(identifier);
        if (!token) {
            return false;
        }
        await this.apiTokenV2Store.delete(token.secret);
        await this.eventService.storeEventsOrThrow([
            new ApiTokenDeletedEvent({
                auditUser,
                apiToken: this.toEventToken(token, token.secret),
            }),
        ]);
        return true;
    }

    async deleteByEnvironment(
        environment: string,
        auditUser: IAuditUser,
    ): Promise<string[]> {
        const deleted =
            await this.apiTokenV2Store.deleteByEnvironment(environment);
        if (deleted.length === 0) {
            return [];
        }

        await this.eventService.storeEventsOrThrow(
            deleted.map(
                (token) =>
                    new ApiTokenDeletedEvent({
                        auditUser,
                        apiToken: this.toEventToken(
                            this.toApiToken(token),
                            token.selector,
                        ),
                    }),
            ),
        );
        return deleted.map((token) => token.selector);
    }

    /**
     * the auth path
     *
     * note: a revoked token stops working within the refresh
     * window - the same bound v1 tokens have always had
     */
    async getUserForToken(
        credential: ApiTokenV2Credential,
    ): Promise<IApiUser | undefined> {
        const token = await this.findVerifiedToken(credential);
        if (!token) {
            return undefined;
        }

        void this.apiTokenV2Store.markSeenAt(token.selector);

        const apiUser: IApiUser = new ApiUser({
            tokenName: token.tokenName,
            permissions: resolveTokenPermissions(token.type),
            projects: token.projects,
            environment: token.environment,
            type: token.type,
            secret: token.selector,
        });
        return apiUser;
    }

    async deleteSystemCreatedTokensNotSeen(): Promise<
        Omit<ApiTokenV2, 'projects'>[]
    > {
        this.logger.info('Cleaning unseen system created tokens');

        const deleted =
            await this.apiTokenV2Store.deleteSystemCreatedTokensNotSeen(
                SYSTEM_TOKEN_LIFETIME_AFTER_LAST_SEEN_IN_MINUTES,
            );

        if (deleted.length === 0) {
            return deleted;
        }

        await this.eventService.storeEventsOrThrow(
            deleted.map((token) => this.createTokenDeletedEvent(token)),
        );

        this.logger.info(
            `Deleted ${deleted.length} unseen system created tokens`,
        );

        return deleted;
    }

    invalidateCache(selectors: string[]): void {
        for (const selector of selectors) {
            this.cache.invalidate(selector);
        }
    }

    private createTokenDeletedEvent(
        token: Omit<ApiTokenV2, 'projects'>,
    ): ApiTokenDeletedEvent {
        const apiToken = this.toApiToken({
            ...token,
            projects: [],
        } as ApiTokenV2);
        return new ApiTokenDeletedEvent({
            auditUser: SYSTEM_USER_AUDIT,
            apiToken: this.toEventToken(apiToken, token.selector),
        });
    }

    private toEventToken(token: IApiToken, selector: string) {
        return {
            ...omitKeys(token, 'secret'),
            selector,
            tokenVersion: 2 as const,
        };
    }

    private toApiToken(token: ApiTokenV2): IApiToken {
        return {
            secret: token.selector,
            tokenName: token.tokenName,
            type: token.type,
            projects: token.projects,
            project: token.projects.join(','),
            environment: token.environment,
            expiresAt: token.expiresAt,
            createdAt: token.createdAt,
            seenAt: token.seenAt,
            secure: true,
        };
    }
}

const toProjectPart = (projects: string[]): string => {
    if (projects.includes('*')) {
        return '*';
    } else if (projects.length === 1) {
        return projects[0];
    } else {
        return '[]';
    }
};

const truncate = (projects: string[], max_length: number) =>
    projects.length > max_length ? `[]` : projects.join('_');
