import type { SWRConfiguration } from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR.js';

export const useCheckDependenciesExist = (
    project: string,
    options: SWRConfiguration = {},
) => {
    const path = formatApiPath(`/api/admin/projects/${project}/dependencies`);
    const { data, error } = useConditionalSWR(
        project,
        false,
        path,
        fetcher,
        options,
    );

    return {
        dependenciesExist: data,
        error,
        loading: !error && !data,
    };
};

const fetcher = async (path: string): Promise<boolean> => {
    const res = await fetch(path).then(
        handleErrorResponses('Dependencies exist check'),
    );
    const data = await res.json();
    return data;
};
