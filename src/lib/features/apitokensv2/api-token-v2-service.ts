import { addMinutes, isPast } from 'date-fns';
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
import { ApiTokenV2Store } from './api-token-v2-store.js';
import EnvironmentStore from '../project-environments/environment-store.js';
import { createEventsService } from '../../server-impl.js';
import { FakeApiTokenV2Store } from './fake-api-token-v2-store.js';
import FakeEnvironmentStore from '../project-environments/fake-environment-store.js';
import {
    createFakeEventsService,
    type EdgeEnvironmentsProjectsListSchema,
    type EdgeTokenSchema,
    type Logger,
} from '../../server-impl.js';
import FakeEventStore from '../../../test/fixtures/fake-event-store.js';
import FakeFeatureTagStore from '../../../test/fixtures/fake-feature-tag-store.js';
import metricsHelper from '../../util/metrics-helper.js';
import {
    FUNCTION_TIME,
    TOKEN_CACHE_LOOKUP,
    emitMetricEvent,
    type TokenLookupResult,
} from '../../metric-events.js';
import {
    AuthorizationTokenKind,
    createTokenV2Credential,
    type ApiTokenV2Credential,
    type ApiTokenV2Identifier,
} from '../../authentication/authorization-token.js';
import { verifyToken } from '../../authentication/token-verifier.js';

export const createApiTokenV2Service: (
    {
        apiTokenV2Store,
        environmentStore,
    }: Pick<IUnleashStores, 'apiTokenV2Store' | 'environmentStore'>,
    { eventBus, getLogger }: Pick<IUnleashConfig, 'eventBus' | 'getLogger'>,
    {
        eventService,
        resourceLimitsService,
    }: Pick<IUnleashServices, 'eventService' | 'resourceLimitsService'>,
) => ApiTokenV2Service = (
    { apiTokenV2Store, environmentStore },
    { eventBus, getLogger },
    { eventService, resourceLimitsService },
) => {
    return new ApiTokenV2Service(
        { apiTokenV2Store, environmentStore },
        { eventBus, getLogger },
        { eventService, resourceLimitsService },
    );
};

const TOKEN_LIFETIME_AFTER_LAST_SEEN_IN_MINUTES = 7 * 24 * 60;

const TOKEN_CACHE_NAME = 'api-token-v2' as const;

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

export const createApiTokenV2ServiceFromDb = (
    db: Db,
    config: IUnleashConfig,
): ApiTokenV2Service =>
    new ApiTokenV2Service(
        {
            apiTokenV2Store: new ApiTokenV2Store(db),
            environmentStore: new EnvironmentStore(db, config.eventBus, config),
        },
        config,
        {
            eventService: createEventsService(db, config),
            resourceLimitsService: new ResourceLimitsService(config),
        },
    );

export const createFakeApiTokenV2Service = (config: IUnleashConfig) => {
    const apiTokenV2Store = new FakeApiTokenV2Store();
    const environmentStore = new FakeEnvironmentStore();
    const fakeEventStore = new FakeEventStore();
    const featureTagStore = new FakeFeatureTagStore();
    const eventService = createFakeEventsService(config, {
        eventStore: fakeEventStore,
        featureTagStore: featureTagStore,
    });
    const resourceLimitsService = new ResourceLimitsService(config);
    return new ApiTokenV2Service(
        { apiTokenV2Store, environmentStore },
        config,
        { eventService, resourceLimitsService },
    );
};

export class ApiTokenV2Service {
    private apiTokenV2Store: IApiTokenV2Store;
    private eventService: EventService;
    private environmentStore: IEnvironmentStore;
    private resourceLimitsService: ResourceLimitsService;
    private eventBus: EventEmitter;
    private logger: Logger;
    private activeTokens = new Map<string, ApiTokenV2WithVerifier>();
    private queryAfter = new Map<string, Date>();
    private timer: Function;

    constructor(
        {
            apiTokenV2Store,
            environmentStore,
        }: Pick<IUnleashStores, 'apiTokenV2Store' | 'environmentStore'>,
        { eventBus, getLogger }: Pick<IUnleashConfig, 'eventBus' | 'getLogger'>,
        {
            eventService,
            resourceLimitsService,
        }: Pick<IUnleashServices, 'eventService' | 'resourceLimitsService'>,
    ) {
        this.apiTokenV2Store = apiTokenV2Store;
        this.eventService = eventService;
        this.environmentStore = environmentStore;
        this.resourceLimitsService = resourceLimitsService;
        this.eventBus = eventBus;
        this.logger = getLogger('features/apitokensv2/api-token-v2-service.ts');
        this.timer = (functionName: string) =>
            metricsHelper.wrapTimer(eventBus, FUNCTION_TIME, {
                className: 'ApiTokenV2Service',
                functionName,
            });
    }

    async fetchActiveTokens(): Promise<void> {
        try {
            const tokens = await this.apiTokenV2Store.getAllActive();
            this.activeTokens = new Map(
                tokens.map((token) => [token.selector, token] as const),
            );
        } catch (e) {
            // a refresh is what bounds how long a revoked token keeps working
            // if a pod stops refreshing -> security-relevant condition
            // log it here - the scheduler's job log cannot say if v1 or v2 cache failed
            this.logger.error(
                `Failed to refresh cache ${TOKEN_CACHE_NAME}; it is now serving stale tokens until the next successful refresh`,
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
        await this.eventService.storeEvent(
            new ApiTokenCreatedEvent({
                auditUser,
                apiToken: omitKeys(this.toApiToken(created), 'secret'),
            }),
        );
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
        const { secret } = credential;
        if (!secret) {
            return undefined;
        }

        let result: TokenLookupResult = 'miss';

        let cachedToken = this.activeTokens.get(credential.selector);
        if (cachedToken?.expiresAt && isPast(cachedToken.expiresAt)) {
            this.activeTokens.delete(credential.selector);
            cachedToken = undefined;
        }
        if (cachedToken && !verifyToken(secret, cachedToken.verifier)) {
            cachedToken = undefined;
        }
        if (cachedToken) {
            result = 'hit';
        }

        const nextAllowedQuery = this.queryAfter.get(secret) ?? 0;
        if (!cachedToken && isPast(nextAllowedQuery)) {
            if (this.queryAfter.size > 1000) {
                // TODO: set a max limit for queryAfter size to prevent memory leak

                this.logger.warn(
                    `${TOKEN_CACHE_NAME}: negative lookup cache reached 1000 entries and was cleared. Repeated tries: might be a client retrying with invalid tokens.`,
                );
                this.queryAfter.clear();
            }
            const stopCacheTimer = this.timer('getTokenWithCache.query');
            const storedToken = await this.apiTokenV2Store.getBySelector(
                credential.selector,
            );
            if (storedToken && verifyToken(secret, storedToken.verifier)) {
                if (storedToken.expiresAt && isPast(storedToken.expiresAt)) {
                    this.queryAfter.set(secret, addMinutes(new Date(), 5));
                } else {
                    this.activeTokens.set(storedToken.selector, storedToken);
                    cachedToken = storedToken;
                }
            } else {
                this.queryAfter.set(secret, addMinutes(new Date(), 5));
            }
            stopCacheTimer();
        } else if (!cachedToken) {
            // query was suppressed by the negative cache
            result = 'throttled';
        }

        emitMetricEvent(this.eventBus, TOKEN_CACHE_LOOKUP, {
            cache: TOKEN_CACHE_NAME,
            result,
        });
        return cachedToken && this.toApiToken(cachedToken);
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
        const cachedToken = this.activeTokens.get(previous.secret);
        if (cachedToken) {
            this.activeTokens.set(cachedToken.selector, {
                ...cachedToken,
                expiresAt: updatedStoreToken.expiresAt,
            });
        }
        const updated = this.toApiToken(updatedStoreToken);
        await this.eventService.storeEvent(
            new ApiTokenUpdatedEvent({
                auditUser,
                previousToken: omitKeys(previous, 'secret'),
                apiToken: omitKeys(updated, 'secret'),
            }),
        );
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
        this.activeTokens.delete(token.secret);
        await this.eventService.storeEvent(
            new ApiTokenDeletedEvent({
                auditUser,
                apiToken: omitKeys(token, 'secret'),
            }),
        );
        return true;
    }

    async getUserForToken({
        secret,
        selector,
    }: ApiTokenV2Credential): Promise<IApiUser | undefined> {
        const token = await this.apiTokenV2Store.getBySelector(selector);
        if (
            !token ||
            !verifyToken(secret, token.verifier) ||
            (token.expiresAt && isPast(token.expiresAt))
        ) {
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
                TOKEN_LIFETIME_AFTER_LAST_SEEN_IN_MINUTES,
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
            this.activeTokens.delete(selector);
        }
    }

    private createTokenDeletedEvent(
        token: Omit<ApiTokenV2, 'projects'>,
    ): ApiTokenDeletedEvent {
        const apiToken = this.toApiToken({
            ...token,
            projects: [],
        } as ApiTokenV2);
        const { secret: _secret, ...tokenWithoutSecret } = apiToken;

        return new ApiTokenDeletedEvent({
            auditUser: SYSTEM_USER_AUDIT,
            apiToken: tokenWithoutSecret,
        });
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
