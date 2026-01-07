import useSWR, { mutate, type SWRConfiguration } from 'swr';
import { useCallback } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import type { FeatureLifecycleSchema } from 'openapi';

interface IUseFeatureLifecycleDataOutput {
    lifecycle: FeatureLifecycleSchema;
    refetchLifecycle: () => void;
    loading: boolean;
    error?: Error;
}

export const formatLifecycleApiPath = (
    projectId: string,
    featureId: string,
): string => {
    return formatApiPath(
        `api/admin/projects/${projectId}/features/${featureId}/lifecycle`,
    );
};

export const useFeatureLifecycle = (
    projectId: string,
    featureId: string,
    options?: SWRConfiguration,
): IUseFeatureLifecycleDataOutput => {
    const path = formatLifecycleApiPath(projectId, featureId);

    const { data, error } = useSWR<FeatureLifecycleSchema>(
        path,
        fetchFeatureLifecycle,
        options,
    );

    const refetchLifecycle = useCallback(() => {
        mutate(path).catch(console.warn);
    }, [path]);

    return {
        lifecycle: data || [],
        refetchLifecycle,
        loading: !error && !data,
        error,
    };
};

const fetchFeatureLifecycle = (
    path: string,
): Promise<FeatureLifecycleSchema> => {
    return fetch(path)
        .then(handleErrorResponses('Feature Lifecycle Data'))
        .then((res) => res.json());
};
