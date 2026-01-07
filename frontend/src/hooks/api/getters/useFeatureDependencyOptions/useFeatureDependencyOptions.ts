import { formatApiPath } from 'utils/formatPath';
import { fetcher, useApiGetter } from '../useApiGetter/useApiGetter.js';

const parentOptionsPath = (projectId: string, childFeatureId: string) =>
    `/api/admin/projects/${projectId}/features/${childFeatureId}/parents`;

export const useParentOptions = (projectId: string, childFeatureId: string) => {
    const path = formatApiPath(parentOptionsPath(projectId, childFeatureId));
    const { data, refetch, loading, error } = useApiGetter<string[]>(path, () =>
        fetcher(path, 'Parent Options'),
    );

    return { parentOptions: data, loading, error };
};

const parentVariantsPath = (projectId: string, parentFeatureId: string) =>
    `/api/admin/projects/${projectId}/features/${parentFeatureId}/parent-variants`;

export const useParentVariantOptions = (
    projectId: string,
    parentFeatureId: string,
) => {
    const path = formatApiPath(parentVariantsPath(projectId, parentFeatureId));
    const { data, refetch, loading, error } = useApiGetter<string[]>(path, () =>
        fetcher(path, 'Parent Variant Options'),
    );

    return { parentVariantOptions: data || [], loading, error };
};
