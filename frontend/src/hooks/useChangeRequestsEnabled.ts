import React from 'react';
import useUiConfig from './api/getters/useUiConfig/useUiConfig';
import { useChangeRequestConfig } from './api/getters/useChangeRequestConfig/useChangeRequestConfig';

export const useChangeRequestsEnabled = (projectId: string) => {
    const { uiConfig } = useUiConfig();
    const { data } = useChangeRequestConfig(projectId);

    const isChangeRequestEnabled = () => {
        return uiConfig?.flags.changeRequests;
    };

    const isChangeRequestConfigured = React.useCallback(
        (environment: string) => {
            const enabled = data.some(draft => {
                return (
                    draft.environment === environment &&
                    draft.changeRequestEnabled
                );
            });

            return isChangeRequestEnabled() && enabled;
        },
        [data]
    );

    const isBannerEnabled = React.useCallback(() => {
        return (
            isChangeRequestEnabled() &&
            data.some(draft => draft.changeRequestEnabled)
        );
    }, [data]);

    return {
        isChangeRequestEnabled,
        isChangeRequestConfigured,
        isBannerEnabled,
    };
};
