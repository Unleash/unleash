import crypto from 'node:crypto';
import { isPast } from 'date-fns';
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
import { omitKeys } from '../../util/index.js';
import { BadDataError, throwExceedsLimitError } from '../../error/index.js';
import type {
    IEnvironmentStore,
    IUnleashConfig,
    IUnleashStores,
} from '../../types/index.js';
import type {
    IUnleashServices,
    ResourceLimitsService,
} from '../../services/index.js';
import {
    resolveValidProjects,
    validateApiToken,
} from '../../types/models/api-token.js';
import type EventEmitter from 'events';

const SELECTOR_BYTES = 16;
const SECRET_BYTES = 32;
const TOKEN_PATTERN = /\.v2_([A-Za-z0-9_-]{22})_([A-Za-z0-9_-]{43})$/;

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

export class ApiTokenV2Service {
    private apiTokenV2Store: IApiTokenV2Store;
    private eventService: EventService;
    private environmentStore: IEnvironmentStore;
    private resourceLimitsService: ResourceLimitsService;
    private eventBus: EventEmitter;

    constructor(
        {
            apiTokenV2Store,
            environmentStore,
        }: Pick<IUnleashStores, 'apiTokenV2Store' | 'environmentStore'>,
        { eventBus }: Pick<IUnleashConfig, 'eventBus'>,
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
