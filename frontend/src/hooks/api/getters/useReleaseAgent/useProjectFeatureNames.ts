import { useCallback } from 'react';
import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';

type ProjectFeaturesResponse = {
    features: Array<{ name: string; type?: string; stale?: boolean }>;
};

export const useProjectFeatureNames = (project: string | undefined) => {
    const path = project
        ? formatApiPath(`api/admin/projects/${project}/features`)
        : null;

    const { data, error, mutate } = useSWR<ProjectFeaturesResponse>(
        path,
        (p: string) =>
            fetch(p)
                .then(handleErrorResponses('Project features'))
                .then((res) => res.json()),
    );

    const refetch = useCallback(() => {
        mutate().catch(console.warn);
    }, [mutate]);

    return {
        features: data?.features ?? [],
        loading: Boolean(project) && !error && !data,
        error,
        refetch,
    };
};
