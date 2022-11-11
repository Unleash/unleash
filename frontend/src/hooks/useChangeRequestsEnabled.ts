import React from 'react';
import useUiConfig from './api/getters/useUiConfig/useUiConfig';
import { useChangeRequestConfig } from './api/getters/useChangeRequestConfig/useChangeRequestConfig';

export const useChangeRequestsEnabled = (projectId: string) => {
    // it can be swapped with proper settings instead of feature flag
    const { uiConfig } = useUiConfig();
    const { data } = useChangeRequestConfig(projectId);

    const isChangeRequestEnabled = React.useCallback(
        (environment: string) => {
            const enabled = data.some(draft => {
                return (
                    draft.environment === environment &&
                    draft.changeRequestEnabled
                );
            });

            console.log(enabled, data, environment);

            return Boolean(uiConfig?.flags?.changeRequests) && enabled;
        },
        [data]
    );

    return { isChangeRequestEnabled };
};
