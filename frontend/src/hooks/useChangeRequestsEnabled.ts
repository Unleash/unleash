import React from 'react';
import useUiConfig from './api/getters/useUiConfig/useUiConfig';
import { useChangeRequestConfig } from './api/getters/useChangeRequestConfig/useChangeRequestConfig';

export const useChangeRequestsEnabled = (projectId: string) => {
    const { uiConfig } = useUiConfig();
    const { data } = useChangeRequestConfig(projectId);

    // console.log('*** data', data);
    // console.log('*** uiConfig', uiConfig);

    const isChangeRequestConfigured = React.useCallback(
        (environment: string): boolean => {
            const enabled = data.some(draft => {
                return (
                    draft.environment === environment &&
                    draft.changeRequestEnabled
                );
            });

            return Boolean(uiConfig?.flags.changeRequests) && enabled;
        },
        [JSON.stringify(data)]
    );

    const isChangeRequestConfiguredInAnyEnv = React.useCallback((): boolean => {
        return (
            Boolean(uiConfig?.flags.changeRequests) &&
            data.some(draft => draft.changeRequestEnabled)
        );
    }, [JSON.stringify(data)]);

    return {
        isChangeRequestFlagEnabled: Boolean(uiConfig?.flags.changeRequests),
        isChangeRequestConfigured,
        isChangeRequestConfiguredInAnyEnv,
    };
};
