import { IUnleashConfig } from '../types';
import { Logger } from '../logger';
import { EdgeTokenSchema } from '../openapi/spec/edge-token-schema';
import { constantTimeCompare } from '../util/constantTimeCompare';
import { ValidatedEdgeTokensSchema } from '../openapi/spec/validated-edge-tokens-schema';
import { ApiTokenService } from './api-token-service';

export default class EdgeService {
    private logger: Logger;

    private apiTokenService: ApiTokenService;

    constructor(
        { apiTokenService }: { apiTokenService: ApiTokenService },
        { getLogger }: Pick<IUnleashConfig, 'getLogger'>,
    ) {
        this.logger = getLogger('lib/services/edge-service.ts');
        this.apiTokenService = apiTokenService;
    }

    async getValidTokens(tokens: string[]): Promise<ValidatedEdgeTokensSchema> {
        const activeTokens = await this.apiTokenService.getAllActiveTokens();
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
