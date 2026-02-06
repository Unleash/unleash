import {
    ApiTokenType,
    type Db,
    type IApiToken,
    type IUnleashConfig,
} from '../types/index.js';
import type { Logger } from '../logger.js';
import type { EdgeTokenSchema } from '../openapi/spec/edge-token-schema.js';
import type { ValidatedEdgeTokensSchema } from '../openapi/spec/validated-edge-tokens-schema.js';
import type { ApiTokenService } from './api-token-service.js';
import metricsHelper from '../util/metrics-helper.js';
import { FUNCTION_TIME } from '../metric-events.js';
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
import EventEmitter from 'events';
import type { Knex } from 'knex';
import { createApiTokenService } from '../features/api-tokens/createApiTokenService.js';

type ReplayProtectionArgs = {
    clientId: string;
    nonce: string;
    expiresAt: Date;
};

export default class EdgeService {
    private logger: Logger;

    private apiTokenService: ApiTokenService;

    private edgeTokenStore: IEdgeTokenStore;

    private readonly edgeMasterSecret: string | undefined;

    private db: Db;

    private eventBus: EventEmitter;

    private config: IUnleashConfig;

    constructor(
        { edgeStore, db }: { edgeStore: IEdgeTokenStore; db: Db },
        { apiTokenService }: { apiTokenService: ApiTokenService },
        config: IUnleashConfig,
    ) {
        this.logger = config.getLogger('lib/services/edge-service.ts');
        this.apiTokenService = apiTokenService;
        this.edgeTokenStore = edgeStore;
        this.edgeMasterSecret = config.edgeMasterSecret;
        this.db = db;
        this.eventBus = config.eventBus;
        this.config = config;
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
        } catch (e) {
            console.error(e);
        }
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
                tokenReq.environment!,
                tokenReq.projects!,
            );
            if (existing !== undefined) {
                tokens.push({
                    projects: existing.projects,
                    type: existing.type,
                    token: existing.secret,
                });
            } else if (tokenReq.environment && tokenReq.projects) {
                // Wrap both operations in a transaction to ensure atomicity
                const newToken = await this.db.transaction(async (trx) => {
                    // Create a transactional API token service
                    const transactionalApiTokenService =
                        createApiTokenService(trx, this.config);

                    // Create API token using the transactional service
                    const token =
                        await transactionalApiTokenService.createApiTokenWithProjects(
                            {
                                tokenName: `enterprise_edge_${tokenReq.environment}_${tokenReq.projects.join('_')}`,
                                alias: `ee_${tokenReq.environment}`,
                                type: ApiTokenType.BACKEND,
                                environment: tokenReq.environment,
                                projects: tokenReq.projects,
                            },
                        );

                    // Save edge token using a transactional store
                    const transactionalEdgeStore = new EdgeTokenStore(
                        trx,
                        this.eventBus,
                        this.config,
                    );
                    await transactionalEdgeStore.saveToken(clientId, token);

                    return token;
                });

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
