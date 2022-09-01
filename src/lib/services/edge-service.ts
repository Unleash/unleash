import { IUnleashStores, IUnleashConfig } from '../types';
import { Logger } from '../logger';
import { IApiTokenStore } from '../types/stores/api-token-store';
import { EdgeTokenSchema } from '../openapi/spec/edge-token-schema';
import { constantTimeCompare } from '../util/constantTimeCompare';
import { ValidateEdgeTokensSchema } from '../openapi/spec/validate-edge-tokens-schema';

export default class EdgeService {
    private logger: Logger;

    private apiTokenStore: IApiTokenStore;

    constructor(
        { apiTokenStore }: Pick<IUnleashStores, 'apiTokenStore'>,
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.logger = getLogger('lib/services/edge-service.ts');
        this.apiTokenStore = apiTokenStore;
    }

    async getValidTokens(tokens: string[]): Promise<ValidateEdgeTokensSchema> {
        const activeTokens = await this.apiTokenStore.getAllActive();
        const edgeTokens = tokens.reduce((result: EdgeTokenSchema[], token) => {
            const dbToken = activeTokens.find((activeToken) =>
                constantTimeCompare(activeToken.secret, token),
            );
            if (dbToken) {
                result.push({
                    token: token,
                    type: dbToken.type,
                    projects: dbToken.projects,
                });
            }
            return result;
        }, []);
        return { tokens: edgeTokens };
    }
}

module.exports = EdgeService;
