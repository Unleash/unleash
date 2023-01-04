import React from 'react';
import { useChangeRequestConfig } from './api/getters/useChangeRequestConfig/useChangeRequestConfig';

export const useChangeRequestsEnabled = (projectId: string) => {
    const { data } = useChangeRequestConfig(projectId);

    const isChangeRequestConfigured = React.useCallback(
        (environment: string): boolean => {
            return data.some(draft => {
                return (
                    draft.environment === environment &&
                    draft.changeRequestEnabled
                );
            });
        },
        [JSON.stringify(data)]
    );

    const isChangeRequestConfiguredInAnyEnv = React.useCallback((): boolean => {
        return data.some(draft => draft.changeRequestEnabled);
    }, [JSON.stringify(data)]);

    return {
        isChangeRequestConfigured,
        isChangeRequestConfiguredInAnyEnv,
    };
};
