import crypto from 'crypto';
import type { Logger } from '../logger';
import { ADMIN, CLIENT, FRONTEND } from '../types/permissions';
import type { IUnleashStores } from '../types/stores';
import type { IUnleashConfig } from '../types/option';
import ApiUser, { type IApiUser } from '../types/api-user';
import {
    ApiTokenType,
    type IApiToken,
    type ILegacyApiTokenCreate,
    type IApiTokenCreate,
    validateApiToken,
    validateApiTokenEnvironment,
    mapLegacyToken,
    mapLegacyTokenWithSecret,
} from '../types/models/api-token';
import type { IApiTokenStore } from '../types/stores/api-token-store';
import { FOREIGN_KEY_VIOLATION } from '../error/db-error';
import BadDataError from '../error/bad-data-error';
import type { IEnvironmentStore } from '../features/project-environments/environment-store-type';
import { constantTimeCompare } from '../util/constantTimeCompare';
import {
    ADMIN_TOKEN_USER,
    ApiTokenCreatedEvent,
    ApiTokenDeletedEvent,
    ApiTokenUpdatedEvent,
    type IAuditUser,
    type IFlagResolver,
    SYSTEM_USER_AUDIT,
} from '../types';
import { omitKeys } from '../util';
import type EventService from '../features/events/event-service';
import { addMinutes, isPast } from 'date-fns';
import metricsHelper from '../util/metrics-helper';
import { FUNCTION_TIME } from '../metric-events';
import type { ResourceLimitsSchema } from '../openapi';
import { throwExceedsLimitError } from '../error/exceeds-limit-error';
import type EventEmitter from 'events';

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

    private queryAfter = new Map<string, Date>();

    private eventService: EventService;

    private lastSeenSecrets: Set<string> = new Set<string>();

    private flagResolver: IFlagResolver;

    private timer: Function;

    private resourceLimits: ResourceLimitsSchema;

    private eventBus: EventEmitter;

    constructor(
        {
            apiTokenStore,
            environmentStore,
        }: Pick<IUnleashStores, 'apiTokenStore' | 'environmentStore'>,
        config: Pick<
            IUnleashConfig,
            | 'getLogger'
            | 'authentication'
            | 'flagResolver'
            | 'eventBus'
            | 'resourceLimits'
        >,
        eventService: EventService,
    ) {
        this.store = apiTokenStore;
        this.eventService = eventService;
        this.environmentStore = environmentStore;
        this.flagResolver = config.flagResolver;
        this.logger = config.getLogger('/services/api-token-service.ts');
        this.resourceLimits = config.resourceLimits;
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
        this.timer = (functionName: string) =>
            metricsHelper.wrapTimer(config.eventBus, FUNCTION_TIME, {
                className: 'ApiTokenService',
                functionName,
            });

        this.eventBus = config.eventBus;
    }

    /**
     * Called by a scheduler without jitter to refresh all active tokens
     */
    async fetchActiveTokens(): Promise<void> {
        try {
            this.activeTokens = await this.store.getAllActive();
        } catch (e) {
            this.logger.warn('Failed to fetch active tokens', e);
        }
    }

    async getToken(secret: string): Promise<IApiToken> {
        return this.store.get(secret);
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

        // If the token is not found, try to find it in the legacy format with alias.
        // This allows us to support the old format of tokens migrating to the embedded proxy.
        if (!token) {
            token = this.activeTokens.find(
                (activeToken) =>
                    Boolean(activeToken.alias) &&
                    constantTimeCompare(activeToken.alias!, secret),
            );
        }

        const nextAllowedQuery = this.queryAfter.get(secret) ?? 0;
        if (!token) {
            if (isPast(nextAllowedQuery)) {
                if (this.queryAfter.size > 1000) {
                    // establish a max limit for queryAfter size to prevent memory leak
                    this.queryAfter.clear();
                }

                const stopCacheTimer = this.timer('getTokenWithCache.query');
                token = await this.store.get(secret);
                if (token) {
                    if (token?.expiresAt && isPast(token.expiresAt)) {
                        this.logger.info('Token has expired');
                        // prevent querying the same invalid secret multiple times. Expire after 5 minutes
                        this.queryAfter.set(secret, addMinutes(new Date(), 5));
                        token = undefined;
                    } else {
                        this.activeTokens.push(token);
                    }
                } else {
                    // prevent querying the same invalid secret multiple times. Expire after 5 minutes
                    this.queryAfter.set(secret, addMinutes(new Date(), 5));
                }
                stopCacheTimer();
            } else {
                this.logger.info(
                    `Not allowed to query this token until: ${this.queryAfter.get(
                        secret,
                    )}`,
                );
            }
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

    public async getAllTokens(): Promise<IApiToken[]> {
        return this.store.getAll();
    }

    private async initApiTokens(tokens: ILegacyApiTokenCreate[]) {
        const tokenCount = await this.store.count();
        if (tokenCount > 0) {
            return;
        }
        try {
            const createAll = tokens
                .map(mapLegacyTokenWithSecret)
                .map((t) => this.insertNewApiToken(t, SYSTEM_USER_AUDIT));
            await Promise.all(createAll);
        } catch (e) {
            this.logger.error('Unable to create initial Admin API tokens');
        }
    }

    public async getUserForToken(
        secret: string,
    ): Promise<IApiUser | undefined> {
        const token = await this.getTokenWithCache(secret);
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
        const previous = await this.store.get(secret);
        const token = await this.store.setExpiry(secret, expiresAt);
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
            const token = await this.store.get(secret);
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
     * @deprecated This may be removed in a future release, prefer createApiTokenWithProjects
     */
    public async createApiToken(
        newToken: Omit<ILegacyApiTokenCreate, 'secret'>,
        auditUser: IAuditUser = SYSTEM_USER_AUDIT,
    ): Promise<IApiToken> {
        const token = mapLegacyToken(newToken);
        return this.internalCreateApiTokenWithProjects(token, auditUser);
    }

    /**
     * @param newToken
     * @param createdBy should be IApiUser or IUser. Still supports optional or string for backward compatibility
     * @param createdByUserId still supported for backward compatibility
     */
    public async createApiTokenWithProjects(
        newToken: Omit<IApiTokenCreate, 'secret'>,
        auditUser: IAuditUser = SYSTEM_USER_AUDIT,
    ): Promise<IApiToken> {
        return this.internalCreateApiTokenWithProjects(newToken, auditUser);
    }

    private async internalCreateApiTokenWithProjects(
        newToken: Omit<IApiTokenCreate, 'secret'>,
        auditUser: IAuditUser,
    ): Promise<IApiToken> {
        validateApiToken(newToken);
        const environments = await this.environmentStore.getAll();
        validateApiTokenEnvironment(newToken, environments);

        await this.validateApiTokenLimit();

        const secret = this.generateSecretKey(newToken);
        const createNewToken = { ...newToken, secret };
        return this.insertNewApiToken(createNewToken, auditUser);
    }

    private async validateApiTokenLimit() {
        const currentTokenCount = await this.store.count();
        const limit = this.resourceLimits.apiTokens;
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
            );
            this.activeTokens.push(token);
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
