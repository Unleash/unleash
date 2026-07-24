import {
    ApiTokenType,
    type Db,
    type IFlagResolver,
    type IUnleashConfig,
    type IUnleashStores,
    SYSTEM_USER_AUDIT,
} from '../types/index.js';
import type { Logger } from '../logger.js';
import type {
    EdgeEnvironmentsProjectsListSchema,
    EdgeTokenSchema,
    ValidatedEdgeTokensSchema,
} from '../openapi/index.js';
import type { ApiTokenService } from './api-token-service.js';
import type {
    EdgeClient,
    IEdgeTokenStore,
} from '../types/stores/edge-store.js';
import { InvalidOperationError } from '../error/index.js';
import {
    decryptSecret,
    encryptSecret,
} from '../features/edgetokens/edge-verification.js';
import { EdgeTokenStore } from '../features/edgetokens/edge-token-store.js';
import {
    createApiTokenService,
    createFakeApiTokenService,
} from '../features/api-tokens/createApiTokenService.js';
import { type IUnleashServices, ResourceLimitsService } from './index.js';
import { FakeEdgeTokenStore } from '../features/edgetokens/fake-edge-token-store.js';
import {
    type ApiTokenV2Service,
    ApiTokenV2Store,
} from '../features/apitokensv2/index.js';
import {
    createApiTokenV2Service,
    createFakeApiTokenV2Service,
} from '../features/apitokensv2/api-token-v2-service.js';
import { createEventsService } from '../server-impl.js';
import EnvironmentStore from '../features/project-environments/environment-store.js';

type ReplayProtectionArgs = {
    clientId: string;
    nonce: string;
    expiresAt: Date;
};

export const createTransactionalEdgeService = (
    db: Db,
    config: IUnleashConfig,
) => {
    const edgeTokenStore = new EdgeTokenStore(db, config.eventBus, config);
    const apiTokenV2Store = new ApiTokenV2Store(db);
    const environmentStore = new EnvironmentStore(db, config.eventBus, config);
    const transactionalApiTokenService = createApiTokenService(db, config);
    const eventService = createEventsService(db, config);
    const resourceLimitsService = new ResourceLimitsService(config);
    const transactionalApiTokenV2Service = createApiTokenV2Service(
        {
            apiTokenV2Store,
            environmentStore,
        },
        config,
        { eventService, resourceLimitsService },
    );
    return new EdgeService(
        { edgeTokenStore },
        {
            apiTokenService: transactionalApiTokenService,
            apiTokenV2Service: transactionalApiTokenV2Service,
        },
        config,
    );
};

export const createFakeEdgeService = (config: IUnleashConfig) => {
    const fakeEdgeTokenStore = new FakeEdgeTokenStore();
    const fakeApiTokenService = createFakeApiTokenService(config);
    const fakeApiTokenService2 = createFakeApiTokenV2Service(config);

    return new EdgeService(
        { edgeTokenStore: fakeEdgeTokenStore },
        {
            apiTokenService: fakeApiTokenService.apiTokenService,
            apiTokenV2Service: fakeApiTokenService2,
        },
        config,
    );
};

export default class EdgeService {
    private logger: Logger;

    private apiTokenService: ApiTokenService;

    private apiTokenV2Service: ApiTokenV2Service;

    private edgeTokenStore: IEdgeTokenStore;

    private readonly edgeMasterKey: string | undefined;

    private flagResolver: IFlagResolver;

    constructor(
        { edgeTokenStore }: Pick<IUnleashStores, 'edgeTokenStore'>,
        {
            apiTokenService,
            apiTokenV2Service,
        }: Pick<IUnleashServices, 'apiTokenService' | 'apiTokenV2Service'>,
        {
            getLogger,
            edgeMasterKey,
            flagResolver,
        }: Pick<IUnleashConfig, 'getLogger' | 'edgeMasterKey' | 'flagResolver'>,
    ) {
        this.logger = getLogger('lib/services/edge-service.ts');
        this.apiTokenService = apiTokenService;
        this.apiTokenV2Service = apiTokenV2Service;
        this.edgeTokenStore = edgeTokenStore;
        this.edgeMasterKey = edgeMasterKey;
        this.flagResolver = flagResolver;
    }

    async getValidTokens(tokens: string[]): Promise<ValidatedEdgeTokensSchema> {
        const validatedTokens: EdgeTokenSchema[] = [];
        if (this.flagResolver.isEnabled('secureTokenStorage')) {
            for (const token of tokens) {
                const found =
                    await this.apiTokenV2Service.getTokenWithCache(token);
                if (found) {
                    validatedTokens.push({
                        token: token,
                        type: found.type,
                        projects: found.projects,
                        environment: found.environment,
                    });
                }
            }
        }
        for (const token of tokens) {
            const found = await this.apiTokenService.getTokenWithCache(token);
            if (found) {
                validatedTokens.push({
                    token: token,
                    type: found.type,
                    projects: found.projects,
                    environment: found.environment,
                });
            }
        }

        return { tokens: validatedTokens };
    }

    async notSeenBefore({
        clientId,
        nonce,
        expiresAt,
    }: ReplayProtectionArgs): Promise<boolean> {
        try {
            await this.edgeTokenStore.registerNonce(clientId, nonce, expiresAt);
            return true;
        } catch (_e) {}
        return false;
    }

    async loadClient(clientId: string): Promise<EdgeClient | undefined> {
        return this.edgeTokenStore.loadClient(clientId);
    }

    decryptedClientSecret(client: EdgeClient): Buffer {
        if (this.edgeMasterKey === undefined) {
            throw new InvalidOperationError(
                'You have to define an EDGE_MASTER_SECRET for this to be supported',
            );
        }
        return decryptSecret(
            Buffer.from(this.edgeMasterKey, 'base64'),
            client.secret_enc,
        );
    }

    async saveClient(clientId: string, secret: string): Promise<void> {
        if (this.edgeMasterKey === undefined) {
            throw new InvalidOperationError('EDGE_MASTER_KEY was not defined');
        }
        const masterSecretBuffer = Buffer.from(this.edgeMasterKey, 'base64');
        if (masterSecretBuffer.length !== 32) {
            throw new InvalidOperationError(
                'You must define a 32 byte secret in the EDGE_MASTER_SECRET environment variable',
            );
        }
        const secretEnc = encryptSecret(masterSecretBuffer, secret);
        await this.edgeTokenStore.saveClient(clientId, secretEnc);
        this.logger.info('Successfully set client secret');
    }

    async getOrCreateTokens(
        clientId: string,
        tokenRequest: EdgeEnvironmentsProjectsListSchema,
    ): Promise<ValidatedEdgeTokensSchema> {
        if (!this.edgeMasterKey) {
            throw new InvalidOperationError(
                'You must define a secret in the EDGE_MASTER_SECRET environment variable',
            );
        }
        const tokens: EdgeTokenSchema[] = [];
        if (this.flagResolver.isEnabled('secureTokenStorage')) {
            const newTokens =
                await this.apiTokenV2Service.createTokensFromEdgeIssue(
                    tokenRequest,
                );
            for (const newToken of newTokens) {
                tokens.push(newToken);
            }
        } else {
            for (const tokenReq of tokenRequest.tokens) {
                const existing = await this.edgeTokenStore.getToken(
                    clientId,
                    tokenReq.environment,
                    tokenReq.projects,
                );
                if (existing !== undefined) {
                    tokens.push({
                        projects: existing.projects,
                        type: existing.type,
                        token: existing.secret,
                        environment: existing.environment,
                    });
                } else if (tokenReq.environment && tokenReq.projects) {
                    const newToken =
                        await this.apiTokenService.createApiTokenWithProjects(
                            {
                                tokenName: `enterprise_edge_${tokenReq.environment}_${truncate(tokenReq.projects, 3)}`,
                                alias: `ee_${tokenReq.environment}`,
                                type: ApiTokenType.BACKEND,
                                environment: tokenReq.environment,
                                projects: tokenReq.projects,
                            },
                            SYSTEM_USER_AUDIT,
                        );
                    await this.edgeTokenStore.saveToken(clientId, newToken);
                    tokens.push({
                        projects: newToken.projects,
                        type: newToken.type,
                        token: newToken.secret,
                        environment: newToken.environment,
                    });
                }
            }
        }

        return { tokens };
    }

    async deleteExpiredNonces() {
        await this.edgeTokenStore.cleanExpiredNonces();
    }

    async deleteAllTokens() {
        await this.edgeTokenStore.deleteAll();
    }
}

const truncate = (projects: string[], max_length: number) =>
    projects.length > max_length ? `[]` : projects.join('_');
