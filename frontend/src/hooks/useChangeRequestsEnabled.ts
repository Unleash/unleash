import useUiConfig from './api/getters/useUiConfig/useUiConfig';

export const useChangeRequestsEnabled = () => {
    // it can be swapped with proper settings instead of feature flag
    const { uiConfig } = useUiConfig();
    return Boolean(uiConfig?.flags?.changeRequests);
};
