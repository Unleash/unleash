import {
    ApiTokenType,
    type Db,
    type IUnleashConfig,
    type IUnleashStores,
} from '../types/index.js';
import type { Logger } from '../logger.js';
import type { EdgeTokenSchema } from '../openapi/spec/edge-token-schema.js';
import type { ValidatedEdgeTokensSchema } from '../openapi/spec/validated-edge-tokens-schema.js';
import type { ApiTokenService } from './api-token-service.js';
import type { EdgeEnvironmentsProjectsListSchema } from '../openapi/index.js';
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
import type { IUnleashServices } from './index.js';
import { FakeEdgeTokenStore } from '../features/edgetokens/fake-edge-token-store.js';

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
    const transactionalApiTokenService = createApiTokenService(db, config);
    return new EdgeService(
        { edgeTokenStore },
        { apiTokenService: transactionalApiTokenService },
        config,
    );
};

export const createFakeEdgeService = (config: IUnleashConfig) => {
    const fakeEdgeTokenStore = new FakeEdgeTokenStore();
    const fakeApiTokenService = createFakeApiTokenService(config);
    return new EdgeService(
        { edgeTokenStore: fakeEdgeTokenStore },
        fakeApiTokenService,
        config,
    );
};

export default class EdgeService {
    private logger: Logger;

    private apiTokenService: ApiTokenService;

    private edgeTokenStore: IEdgeTokenStore;

    private readonly edgeMasterSecret: string | undefined;

    constructor(
        { edgeTokenStore }: Pick<IUnleashStores, 'edgeTokenStore'>,
        { apiTokenService }: Pick<IUnleashServices, 'apiTokenService'>,
        {
            getLogger,
            edgeMasterSecret,
        }: Pick<IUnleashConfig, 'getLogger' | 'edgeMasterSecret'>,
    ) {
        this.logger = getLogger('lib/services/edge-service.ts');
        this.apiTokenService = apiTokenService;
        this.edgeTokenStore = edgeTokenStore;
        this.edgeMasterSecret = edgeMasterSecret;
    }

    async getValidTokens(tokens: string[]): Promise<ValidatedEdgeTokensSchema> {
        // new behavior: use cached tokens when possible
        // use the db to fetch the missing ones
        // cache stores both missing and active so we don't hammer the db
        const validatedTokens: EdgeTokenSchema[] = [];
        for (const token of tokens) {
            const found = await this.apiTokenService.getTokenWithCache(token);
            if (found) {
                validatedTokens.push({
                    token: token,
                    type: found.type,
                    projects: found.projects,
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
            await this.edgeTokenStore.checkNonce(clientId, nonce, expiresAt);
            return true;
        } catch (_e) {}
        return false;
    }
    async loadClient(clientId: string): Promise<EdgeClient | undefined> {
        return this.edgeTokenStore.loadClient(clientId);
    }

    decryptedClientSecret(client: EdgeClient): Buffer {
        if (this.edgeMasterSecret === undefined) {
            throw new InvalidOperationError(
                'You have to define an EDGE_MASTER_SECRET for this to be supported',
            );
        }
        return decryptSecret(
            Buffer.from(this.edgeMasterSecret, 'base64'),
            client.secret_enc,
        );
    }

    async saveClient(clientId: string, secret: string): Promise<void> {
        if (this.edgeMasterSecret === undefined) {
            throw new InvalidOperationError(
                'EDGE_MASTER_SECRET was not defined',
            );
        }
        const masterSecretBuffer = Buffer.from(this.edgeMasterSecret, 'base64');
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
        if (!this.edgeMasterSecret) {
            throw new InvalidOperationError(
                'You must define a secret in the EDGE_MASTER_SECRET environment variable',
            );
        }
        const tokens: EdgeTokenSchema[] = [];
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
                });
            } else if (tokenReq.environment && tokenReq.projects) {
                const newToken =
                    await this.apiTokenService.createApiTokenWithProjects({
                        tokenName: `enterprise_edge_${tokenReq.environment}_${truncate(tokenReq.projects, 3)}`,
                        alias: `ee_${tokenReq.environment}`,
                        type: ApiTokenType.BACKEND,
                        environment: tokenReq.environment,
                        projects: tokenReq.projects,
                    });
                await this.edgeTokenStore.saveToken(clientId, newToken);
                tokens.push({
                    projects: newToken.projects,
                    type: newToken.type,
                    token: newToken.secret,
                });
            }
        }

        return { tokens };
    }
}

const truncate = (projects: string[], max_length: number) =>
    projects.length > max_length ? `[]` : projects.join('_');
