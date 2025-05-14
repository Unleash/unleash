import type { IChangeRequestEnvironmentConfig } from 'component/changeRequest/changeRequest.types';
import React from 'react';
import { useChangeRequestConfig } from './api/getters/useChangeRequestConfig/useChangeRequestConfig.js';

export const getHighestChangeRequestEnv =
    (data: IChangeRequestEnvironmentConfig[]) => (): string | undefined => {
        const changeRequestEnvs = data.filter(
            (env) => env.changeRequestEnabled,
        );

        const env =
            changeRequestEnvs.find((env) => env.type === 'production') ??
            changeRequestEnvs[0];

        return env?.environment;
    };

export const useHighestPermissionChangeRequestEnvironment = (
    projectId?: string,
) => {
    const { data } = useChangeRequestConfig(projectId || '');

    return React.useCallback(getHighestChangeRequestEnv(data), [
        JSON.stringify(data),
    ]);
};
