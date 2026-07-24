import crypto from 'node:crypto';
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
    ApiTokenV2WithSecret,
    CreateApiTokenV2,
    IApiTokenV2Store,
} from './api-token-v2-types.js';
import type EventService from '../events/event-service.js';
import { constantTimeCompare, omitKeys } from '../../util/index.js';
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
import { FUNCTION_TIME } from '../../metric-events.js';

const SELECTOR_BYTES = 16;
const SECRET_BYTES = 32;
const TOKEN_PATTERN = /\.v2_([A-Za-z0-9_-]{22})_([A-Za-z0-9_-]{43})$/;

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
    private activeTokens: IApiToken[] = [];
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
        await this.validateApiTokenLimit();

        const selector = crypto
            .randomBytes(SELECTOR_BYTES)
            .toString('base64url');
        const secretPart = crypto
            .randomBytes(SECRET_BYTES)
            .toString('base64url');
        const secret = `${toProjectPart(token.projects)}:${token.environment}.v2_${selector}_${secretPart}`;
        const created = await this.apiTokenV2Store.create(
            token,
            selector,
            this.createVerifier(secret),
        );
        await this.eventService.storeEvent(
            new ApiTokenCreatedEvent({
                auditUser,
                apiToken: omitKeys(this.toApiToken(created), 'secret'),
            }),
        );
        return { ...created, secret };
    }

    private async validateApiTokenLimit() {
        const currentTokenCount = await this.apiTokenV2Store.count();
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

    async getToken(secretOrSelector: string): Promise<IApiToken | undefined> {
        const selector = this.getSelector(secretOrSelector);
        if (!selector) {
            return undefined;
        }
        const token = await this.apiTokenV2Store.getBySelector(selector);
        if (!token) {
            return undefined;
        }
        return this.toApiToken(token);
    }
    async getTokenWithCache(secret: string): Promise<IApiToken | undefined> {
        if (!secret) {
            return undefined;
        }

        let token = this.activeTokens.find(
            (activeToken) =>
                Boolean(activeToken.secret) &&
                constantTimeCompare(activeToken.secret, secret),
        );
        const nextAllowedQuery = this.queryAfter.get(secret) ?? 0;
        if (!token) {
            if (isPast(nextAllowedQuery)) {
                if (this.queryAfter.size > 1000) {
                    this.queryAfter.clear();
                }
                const stopCacheTimer = this.timer('getTokenWithCache.query');
                token = await this.getToken(secret);
                if (token) {
                    if (token.expiresAt && isPast(token.expiresAt)) {
                        this.queryAfter.set(secret, addMinutes(new Date(), 5));
                        token = undefined;
                    } else {
                        this.activeTokens.push(token);
                    }
                } else {
                    this.queryAfter.set(secret, addMinutes(new Date(), 5));
                }
                stopCacheTimer();
            }
        }
        return token;
    }

    async getUserDefinedTokens(): Promise<IApiToken[]> {
        const tokens = await this.apiTokenV2Store.getUserDefinedTokens();
        return tokens.map((token) => this.toApiToken(token));
    }

    async updateExpiry(
        secretOrSelector: string,
        expiresAt: Date,
        auditUser: IAuditUser,
    ): Promise<IApiToken | undefined> {
        const previous = await this.getToken(secretOrSelector);
        if (!previous) {
            return undefined;
        }
        const token = await this.apiTokenV2Store.setExpiry(
            previous.secret,
            expiresAt,
        );
        if (!token) {
            return undefined;
        }
        const updated = this.toApiToken(token);
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
        secretOrSelector: string,
        auditUser: IAuditUser,
    ): Promise<boolean> {
        const token = await this.getToken(secretOrSelector);
        if (!token) {
            return false;
        }
        await this.apiTokenV2Store.delete(token.secret);
        await this.eventService.storeEvent(
            new ApiTokenDeletedEvent({
                auditUser,
                apiToken: omitKeys(token, 'secret'),
            }),
        );
        return true;
    }

    async getUserForToken(secret: string): Promise<IApiUser | undefined> {
        const parsed = this.parse(secret);
        if (!parsed) {
            return undefined;
        }

        const token = await this.apiTokenV2Store.getBySelector(parsed.selector);
        if (
            !token ||
            !this.verify(secret, token.verifier) ||
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

    async deleteSystemCreatedTokensNotSeen(): Promise<void> {
        this.logger.info('Cleaning unseen system created tokens');
        await this.apiTokenV2Store.deleteSystemCreatedTokensNotSeen(
            TOKEN_LIFETIME_AFTER_LAST_SEEN_IN_MINUTES,
        );
    }

    private parse(token: string): { selector: string } | undefined {
        const match = TOKEN_PATTERN.exec(token);
        return match ? { selector: match[1] } : undefined;
    }

    private getSelector(secretOrSelector: string): string | undefined {
        return this.parse(secretOrSelector)?.selector || secretOrSelector;
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

    private createVerifier(token: string): string {
        return crypto.createHash('sha256').update(token).digest('base64url');
    }

    private verify(token: string, verifier: string): boolean {
        const expected = Buffer.from(this.createVerifier(token));
        const actual = Buffer.from(verifier);
        return (
            expected.length === actual.length &&
            crypto.timingSafeEqual(expected, actual)
        );
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
