import type { IFlagResolver, IUnleashConfig } from '../types';
import type { Logger } from '../logger';
import type { EdgeTokenSchema } from '../openapi/spec/edge-token-schema';
import { constantTimeCompare } from '../util/constantTimeCompare';
import type { ValidatedEdgeTokensSchema } from '../openapi/spec/validated-edge-tokens-schema';
import type { ApiTokenService } from './api-token-service';
import metricsHelper from '../util/metrics-helper';
import { FUNCTION_TIME } from '../metric-events';

export default class EdgeService {
    private logger: Logger;

    private apiTokenService: ApiTokenService;

    private flagResolver: IFlagResolver;

    private timer: Function;

    constructor(
        { apiTokenService }: { apiTokenService: ApiTokenService },
        {
            getLogger,
            flagResolver,
            eventBus,
        }: Pick<IUnleashConfig, 'getLogger' | 'flagResolver' | 'eventBus'>,
    ) {
        this.logger = getLogger('lib/services/edge-service.ts');
        this.apiTokenService = apiTokenService;
        this.flagResolver = flagResolver;
        this.timer = (functionName: string) =>
            metricsHelper.wrapTimer(eventBus, FUNCTION_TIME, {
                className: 'EdgeService',
                functionName,
            });
    }

    async getValidTokens(tokens: string[]): Promise<ValidatedEdgeTokensSchema> {
        if (this.flagResolver.isEnabled('checkEdgeValidTokensFromCache')) {
            const stopTimer = this.timer('validateTokensWithCache');
            // new behavior: use cached tokens when possible
            // use the db to fetch the missing ones
            // cache stores both missing and active so we don't hammer the db
            const validatedTokens: EdgeTokenSchema[] = [];
            for (const token of tokens) {
                const found =
                    await this.apiTokenService.getTokenWithCache(token);
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
        } else {
            // old behavior: go to the db to fetch all tokens and then filter in memory
            const stopTimer = this.timer('validateTokensWithoutCache');
            const activeTokens =
                await this.apiTokenService.getAllActiveTokens();
            const edgeTokens = tokens.reduce(
                (result: EdgeTokenSchema[], token) => {
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
                },
                [],
            );
            stopTimer();
            return { tokens: edgeTokens };
        }
    }
}

module.exports = EdgeService;
