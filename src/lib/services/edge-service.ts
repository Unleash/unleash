import { IUnleashStores, IUnleashConfig } from '../types';
import { Logger } from '../logger';
import { ValidateEdgeTokensSchema } from '../openapi/spec/validate-edge-tokens-schema';
import { IApiTokenStore } from '../types/stores/api-token-store';
import { EdgeTokensSchema } from '../openapi/spec/edge-token-schema';

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
        const edgeTokens = tokens.reduce(
            (result: EdgeTokensSchema[], token) => {
                const dbToken = activeTokens.find(
                    (activeToken) => activeToken.secret === token,
                );
                if (dbToken) {
                    result.push({
                        token: token,
                        type: dbToken.type,
                        projects: dbToken.projects,
                    });
                }
                return result;
            },
            [],
        );
        return { tokens: edgeTokens };
    }
}

module.exports = EdgeService;
