import type { IUnleashConfig } from '../types';
import type { Logger } from '../logger';
import type { EdgeTokenSchema } from '../openapi/spec/edge-token-schema';
import type { ValidatedEdgeTokensSchema } from '../openapi/spec/validated-edge-tokens-schema';
import type { ApiTokenService } from './api-token-service';
import metricsHelper from '../util/metrics-helper';
import { FUNCTION_TIME } from '../metric-events';

export default class EdgeService {
    private logger: Logger;

    private apiTokenService: ApiTokenService;

    private timer: Function;

    constructor(
        { apiTokenService }: { apiTokenService: ApiTokenService },
        {
            getLogger,
            eventBus,
        }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver' | 'eventBus'>,
    ) {
        this.logger = getLogger('lib/services/edge-service.ts');
        this.apiTokenService = apiTokenService;
        this.timer = (functionName: string) =>
            metricsHelper.wrapTimer(eventBus, FUNCTION_TIME, {
                className: 'EdgeService',
                functionName,
            });
    }

    async getValidTokens(tokens: string[]): Promise<ValidatedEdgeTokensSchema> {
        const stopTimer = this.timer('validateTokensWithCache');
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
        stopTimer();
        return { tokens: validatedTokens };
    }
}

module.exports = EdgeService;
