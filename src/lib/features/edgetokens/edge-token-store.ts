import type {
    EdgeClient,
    IEdgeTokenStore,
} from '../../types/stores/edge-store.js';
import type { Db } from '../../db/db.js';
import type EventEmitter from 'events';
import metricsHelper from '../../util/metrics-helper.js';
import { DB_TIME } from '../../metric-events.js';
import {
    ApiTokenType,
    type IApiToken,
    type IUnleashConfig,
} from '../../types/index.js';
import { scopeHash } from './edge-tokens.js';
import { ulid } from 'ulidx';

const T = {
    apiTokens: 'api_tokens',
    edgeApiTokens: 'edge_api_tokens',
    edgeHmacClients: 'edge_hmac_clients',
    edgeHmacNonces: 'edge_hmac_nonces',
};

interface EdgeApiTokenRow {
    environment: string;
    projects: string;
    token_value: string;
    created_at: Date;
    token_name: string;
}

export class EdgeTokenStore implements IEdgeTokenStore {
    private db: Db;

    private readonly timer: Function;

    constructor(
        db: Db,
        eventBus: EventEmitter,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.db = db;
        this.timer = (action) =>
            metricsHelper.wrapTimer(eventBus, DB_TIME, {
                store: 'edge-store',
                action,
            });
    }

    async registerNonce(
        clientId: string,
        nonce: string,
        expiresAt: Date,
    ): Promise<void> {
        const stop = this.timer('check_nonce');
        await this.db(T.edgeHmacNonces).insert({
            client_id: clientId,
            nonce,
            expires_at: expiresAt,
        });
        stop();
    }

    async saveToken(clientId: string, apiToken: IApiToken): Promise<void> {
        const stop = this.timer('save_token');
        const hash = scopeHash(apiToken.environment, apiToken.projects);
        await this.db(T.edgeApiTokens).insert({
            id: ulid(),
            client_id: clientId,
            environment: apiToken.environment,
            projects: JSON.stringify(apiToken.projects),
            scope_hash: hash,
            token_value: apiToken.secret,
        });
        stop();
    }
    async getToken(
        clientId: string,
        environment: string,
        projects: string[],
    ): Promise<IApiToken | undefined> {
        const stop = this.timer('get_token');
        const hash = scopeHash(environment, projects);
        const tokens = await this.db<EdgeApiTokenRow>(T.edgeApiTokens)
            .where('client_id', clientId)
            .andWhere('scope_hash', hash)
            .leftJoin(T.apiTokens, 'token_value', `${T.apiTokens}.secret`)
            .select([
                `${T.edgeApiTokens}.environment`,
                `${T.edgeApiTokens}.projects`,
                `${T.edgeApiTokens}.token_value`,
                `${T.edgeApiTokens}.created_at`,
                `${T.apiTokens}.token_name`,
            ]);
        stop();
        if (tokens && tokens.length > 0) {
            const token = tokens[0];
            return {
                createdAt: token.created_at,
                projects: token.projects,
                project: '',
                environment: token.environment,
                secret: token.token_value,
                type: ApiTokenType.BACKEND,
                tokenName: token.token_name,
            };
        }
        return undefined;
    }

    async loadClient(clientId: string): Promise<EdgeClient | undefined> {
        const stop = this.timer('load_client');
        const client = await this.db<EdgeClient>(T.edgeHmacClients)
            .where({ id: clientId })
            .select('id', 'secret_enc');
        stop();
        if (client && client.length > 0) {
            return client[0];
        }
        return undefined;
    }

    async saveClient(clientId: string, secretEnc: Buffer): Promise<void> {
        const stop = this.timer('save_client');
        await this.db(T.edgeHmacClients)
            .insert({
                id: clientId,
                secret_enc: secretEnc,
            })
            .onConflict(['id'])
            .merge({ secret_enc: secretEnc, created_at: new Date() });
        stop();
    }

    async cleanExpiredNonces(): Promise<void> {
        const stop = this.timer('clean_expired_nonces');
        await this.db(T.edgeHmacNonces)
            .where('expires_at', '<', new Date())
            .delete();
        stop();
    }
}
