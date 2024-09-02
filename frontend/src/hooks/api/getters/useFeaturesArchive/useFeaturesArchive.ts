import useSWR from 'swr';
import type { ArchivedFeaturesSchema } from 'openapi';
import handleErrorResponses from '../httpErrorResponseHandler';
import { formatApiPath } from 'utils/formatPath';

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Feature flag archive'))
        .then((res) => res.json());
};

export const useFeaturesArchive = (projectId?: string) => {
    const { data, error, mutate, isLoading } = useSWR<ArchivedFeaturesSchema>(
        formatApiPath(
            projectId
                ? `/api/admin/archive/features/${projectId}`
                : 'api/admin/archive/features',
        ),
        fetcher,
        {
            refreshInterval: 15 * 1000, // ms
        },
    );

    return {
        archivedFeatures: data?.features,
        refetchArchived: mutate,
        loading: isLoading,
        error,
    };
};
