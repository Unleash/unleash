import useUiConfig from './api/getters/useUiConfig/useUiConfig';
import { SWRConfiguration } from 'swr';
import { useCallback } from 'react';
import handleErrorResponses from './api/getters/httpErrorResponseHandler';
import { useConditionalSWR } from './api/getters/useConditionalSWR/useConditionalSWR';
import {
    DefaultStickiness,
    ProjectMode,
} from 'component/project/Project/hooks/useProjectForm';
import { formatApiPath } from '../utils/formatPath';

export interface ISettingsResponse {
    defaultStickiness?: DefaultStickiness;
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

    const { data, error, mutate } = useConditionalSWR<ISettingsResponse>(
        Boolean(projectId) && Boolean(projectScopedStickiness),
        {},
        ['useDefaultProjectSettings', PATH],
        () => fetcher(formatApiPath(PATH)),
        options
    );

    const defaultStickiness: DefaultStickiness =
        data?.defaultStickiness ?? DEFAULT_STICKINESS;

    const refetch = useCallback(() => {
        mutate().catch(console.warn);
    }, [mutate]);
    return {
        defaultStickiness,
        refetch,
        loading: !error && !data,
        error,
    };
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Project stickiness data'))
        .then(res => res.json());
};
