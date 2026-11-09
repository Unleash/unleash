import type { Db, IUnleashConfig, IUnleashStores } from '../types/index.js';
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
import type { IUnleashServices } from './index.js';
import { FakeEdgeTokenStore } from '../features/edgetokens/fake-edge-token-store.js';
import {
    AuthorizationTokenKind,
    parseAuthorizationToken,
} from '../authentication/authorization-token.js';
import {
    type AdminApiTokenV2Service,
    createApiTokenV2Service,
    type ReadOnlyApiTokenV2Service,
} from '../features/apitokensv2/api-token-v2-service.js';

type ReplayProtectionArgs = {
    clientId: string;
    nonce: string;
    expiresAt: Date;
};

export const createTransactionalEdgeService = (
    db: Db,
    config: IUnleashConfig,
    {
        apiTokenService,
        apiTokenV2Service,
    }: Pick<IUnleashServices, 'apiTokenService' | 'apiTokenV2Service'>,
) => {
    const edgeTokenStore = new EdgeTokenStore(db, config.eventBus, config);
    const apiTokenV2CreationService = createApiTokenV2Service(config)(db);
    return new EdgeService(
        { edgeTokenStore },
        {
            apiTokenService,
            apiTokenV2Service,
            // Writes must use the Edge transaction, while validation shares
            // the caches warmed and invalidated by the main token services.
            apiTokenV2CreationService,
        },
        config,
    );
};

export const createFakeEdgeService = (
    config: IUnleashConfig,
    tokenServices: Pick<
        IUnleashServices,
        | 'apiTokenService'
        | 'apiTokenV2Service'
        | 'transactionalApiTokenV2Service'
    >,
) => {
    const fakeEdgeTokenStore = new FakeEdgeTokenStore();

    return new EdgeService(
        { edgeTokenStore: fakeEdgeTokenStore },
        {
            apiTokenService: tokenServices.apiTokenService,
            apiTokenV2Service: tokenServices.apiTokenV2Service,
            apiTokenV2CreationService:
                tokenServices.transactionalApiTokenV2Service,
        },
        config,
    );
};

export default class EdgeService {
    private logger: Logger;

    private apiTokenService: ApiTokenService;

    private apiTokenV2Service: ReadOnlyApiTokenV2Service;

    private apiTokenV2CreationService: AdminApiTokenV2Service;

    private edgeTokenStore: IEdgeTokenStore;

    private readonly edgeMasterKey: string | undefined;

    constructor(
        { edgeTokenStore }: Pick<IUnleashStores, 'edgeTokenStore'>,
        {
            apiTokenService,
            apiTokenV2Service,
            apiTokenV2CreationService,
        }: Pick<IUnleashServices, 'apiTokenService' | 'apiTokenV2Service'> & {
            apiTokenV2CreationService: AdminApiTokenV2Service;
        },
        {
            getLogger,
            edgeMasterKey,
        }: Pick<IUnleashConfig, 'getLogger' | 'edgeMasterKey'>,
    ) {
        this.logger = getLogger('lib/services/edge-service.ts');
        this.apiTokenService = apiTokenService;
        this.apiTokenV2Service = apiTokenV2Service;
        this.apiTokenV2CreationService = apiTokenV2CreationService;
        this.edgeTokenStore = edgeTokenStore;
        this.edgeMasterKey = edgeMasterKey;
    }

    async getValidTokens(tokens: string[]): Promise<ValidatedEdgeTokensSchema> {
        const validatedTokens: EdgeTokenSchema[] = [];
        for (const token of tokens) {
            const parsedToken = parseAuthorizationToken(token);
            const v2Token =
                parsedToken?.kind === AuthorizationTokenKind.API_TOKEN &&
                parsedToken.version === 'v2'
                    ? await this.apiTokenV2Service.getTokenWithCache(
                          parsedToken,
                      )
                    : undefined;
            const found =
                v2Token ??
                (await this.apiTokenService.getTokenWithCache(token));
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
        const tokens =
            await this.apiTokenV2CreationService.createTokensFromEdgeIssue(
                tokenRequest,
            );

        return { tokens };
    }

    async deleteExpiredNonces() {
        await this.edgeTokenStore.cleanExpiredNonces();
    }

    async deleteAllTokens() {
        await this.edgeTokenStore.deleteAll();
    }
}
