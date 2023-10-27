import useSWR, { SWRConfiguration } from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';

export const useParentOptions = (
    project: string,
    childFeatureId: string,
    options: SWRConfiguration = {},
) => {
    const path = formatApiPath(
        `/api/admin/projects/${project}/features/${childFeatureId}/parents`,
    );
    const { data, error, mutate } = useSWR(path, fetcher, options);

    return {
        parentOptions: data,
        error,
        loading: !error && !data,
    };
};

const fetcher = async (path: string): Promise<string[]> => {
    const res = await fetch(path).then(handleErrorResponses('Parent Options'));
    const data = await res.json();
    return data;
};
