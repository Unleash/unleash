import { SKIP_CHANGE_REQUEST } from 'component/providers/AccessProvider/permissions';
import React from 'react';
import { useChangeRequestConfig } from './api/getters/useChangeRequestConfig/useChangeRequestConfig';
import { useCheckProjectPermissions } from './useHasAccess';

export const useChangeRequestsEnabled = (projectId: string) => {
    const { data } = useChangeRequestConfig(projectId);
    const checkAccess = useCheckProjectPermissions(projectId);

    const isChangeRequestConfigured = React.useCallback(
        (environment: string): boolean => {
            const canSkipChangeRequest = checkAccess(
                SKIP_CHANGE_REQUEST,
                environment
            );
            return canSkipChangeRequest
                ? false
                : data.some(draft => {
                      return (
                          draft.environment === environment &&
                          draft.changeRequestEnabled
                      );
                  });
        },
        [JSON.stringify(data)]
    );

    const isChangeRequestConfiguredForReview = React.useCallback(
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

    const highestPermissionChangeRequestEnv = React.useCallback(():
        | string
        | undefined => {
        const changeRequestEnvs = data.filter(env => env.changeRequestEnabled);

        const env =
            changeRequestEnvs.find(env => env.environment === 'production') ??
            changeRequestEnvs[0];

        return env.environment;
    }, [JSON.stringify(data)]);

    return {
        isChangeRequestConfigured,
        isChangeRequestConfiguredInAnyEnv,
        isChangeRequestConfiguredForReview,
        highestPermissionChangeRequestEnv,
    };
};
