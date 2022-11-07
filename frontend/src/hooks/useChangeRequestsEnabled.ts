import useUiConfig from './api/getters/useUiConfig/useUiConfig';

export const useChangeRequestsEnabled = (environment?: string) => {
    // it can be swapped with proper settings instead of feature flag
    const { uiConfig } = useUiConfig();
    return (
        Boolean(uiConfig?.flags?.changeRequests) &&
        (environment === 'production' || typeof environment === 'undefined')
    );
};
