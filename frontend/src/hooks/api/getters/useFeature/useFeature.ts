import useSWR, { type SWRConfiguration } from 'swr';
import { useCallback } from 'react';
import { emptyFeature } from './emptyFeature.ts';
import handleErrorResponses from '../httpErrorResponseHandler.ts';
import { formatApiPath } from 'utils/formatPath';
import type { FeatureSchema } from 'openapi';

export interface IUseFeatureOutput {
    feature: FeatureSchema;
    refetchFeature: () => void;
    loading: boolean;
    status?: number;
    error?: Error;
}

export interface IFeatureResponse {
    status: number;
    body?: FeatureSchema;
}

export const useFeature = (
    projectId: string,
    featureId: string,
    options?: SWRConfiguration,
): IUseFeatureOutput => {
    const path = formatFeatureApiPath(projectId, featureId);

    const { data, error, mutate } = useSWR<IFeatureResponse>(
        ['useFeature', path],
        () => featureFetcher(path),
        options,
    );

    const refetchFeature = useCallback(() => {
        mutate().catch(console.warn);
    }, [mutate]);

    return {
        feature: data?.body || emptyFeature,
        refetchFeature,
        loading: !error && !data,
        status: data?.status,
        error,
    };
};

export const featureFetcher = async (
    path: string,
): Promise<IFeatureResponse> => {
    const res = await fetch(path);

    if (res.status === 404) {
        return { status: 404 };
    }

    if (!res.ok) {
        await handleErrorResponses('Feature flag data')(res);
    }

    return {
        status: res.status,
        body: await res.json(),
    };
};

export const formatFeatureApiPath = (
    projectId: string,
    featureId: string,
): string => {
    return formatApiPath(
        `api/admin/projects/${projectId}/features/${featureId}?variantEnvironments=true`,
    );
};
