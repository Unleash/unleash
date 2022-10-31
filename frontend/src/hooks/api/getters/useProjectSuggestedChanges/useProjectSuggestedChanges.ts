import useSWR from 'swr';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('SuggestedChanges'))
        .then(res => res.json());
};

export const useProjectSuggestedChanges = (project: string) => {
    const { data, error, mutate } = useSWR(
        formatApiPath(`api/admin/projects/${project}/suggest-changes`),
        fetcher
    );

    return useMemo(
        () => ({
            changesets: data,
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate]
    );
};
