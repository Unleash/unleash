import useUiConfig from './api/getters/useUiConfig/useUiConfig';
import { SWRConfiguration } from 'swr';
import { useCallback } from 'react';
import handleErrorResponses from './api/getters/httpErrorResponseHandler';
import { useConditionalSWR } from './api/getters/useConditionalSWR/useConditionalSWR';
import { ProjectMode } from 'component/project/Project/hooks/useProjectForm';
import { formatApiPath } from 'utils/formatPath';

export interface ISettingsResponse {
    defaultStickiness?: string;
    mode?: ProjectMode;
}
const DEFAULT_STICKINESS = 'default';
export const useDefaultProjectSettings = (
    projectId?: string,
    options?: SWRConfiguration
) => {
    const { uiConfig } = useUiConfig();

    const PATH = `api/admin/projects/${projectId}/settings`;
    const { projectScopedStickiness } = uiConfig.flags;

    const { data, isLoading, error, mutate } =
        useConditionalSWR<ISettingsResponse>(
            Boolean(projectId) && Boolean(projectScopedStickiness),
            {},
            ['useDefaultProjectSettings', PATH],
            () => fetcher(formatApiPath(PATH)),
            options
        );

    const defaultStickiness = (): string => {
        if (!isLoading) {
            if (data?.defaultStickiness) {
                return data?.defaultStickiness;
            }
            return DEFAULT_STICKINESS;
        }
        return '';
    };

    const refetch = useCallback(() => {
        mutate().catch(console.warn);
    }, [mutate]);
    return {
        defaultStickiness: defaultStickiness(),
        refetch,
        loading: isLoading,
        error,
    };
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Project stickiness data'))
        .then(res => res.json());
};
