import { useApiTokens } from 'hooks/api/getters/useApiTokens/useApiTokens';
import useUiConfig from 'hooks/api/getters/useUiConfig/useUiConfig';

export const useApiTokenLimit = () => {
    const { tokens, loading: loadingTokens } = useApiTokens();
    const { uiConfig, loading: loadingConfig } = useUiConfig();
    const apiTokensLimit = uiConfig.resourceLimits.apiTokens;

    return {
        limit: apiTokensLimit,
        currentValue: tokens.length,
        limitReached: tokens.length >= apiTokensLimit,
        loading: loadingConfig || loadingTokens,
    };
};
