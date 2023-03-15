import useUiConfig from './api/getters/useUiConfig/useUiConfig';
import useSWR, { SWRConfiguration } from 'swr';
import { useCallback } from 'react';
import handleErrorResponses from './api/getters/httpErrorResponseHandler';

export interface IStickinessResponse {
    status: number;

    body?: {
        defaultStickiness: string;
        mode?: string;
    };
}
const DEFAULT_STICKINESS = 'default';
export const useDefaultProjectSettings = (
    projectId?: string,
    options?: SWRConfiguration
) => {
    const { uiConfig } = useUiConfig();

    const PATH = `/api/admin/projects/${projectId}/settings`;
    const { projectScopedStickiness } = uiConfig.flags;

    const { data, error, mutate } = useSWR<IStickinessResponse>(
        ['useDefaultProjectSettings', PATH],
        () => fetcher(PATH),
        options
    );

    const defaultStickiness =
        Boolean(projectScopedStickiness) && data?.body != null && projectId
            ? data.body.defaultStickiness
            : DEFAULT_STICKINESS;

    const refetch = useCallback(() => {
        mutate().catch(console.warn);
    }, [mutate]);
    return {
        defaultStickiness,
        refetch,
        loading: !error && !data,
        status: data?.status,
        error,
    };
};

export const fetcher = async (path: string): Promise<IStickinessResponse> => {
    const res = await fetch(path);

    if (res.status === 404) {
        return { status: 404 };
    }

    if (!res.ok) {
        await handleErrorResponses('Project stickiness data')(res);
    }

    return {
        status: res.status,
        body: await res.json(),
    };
};
