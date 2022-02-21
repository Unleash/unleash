import useSWR, { mutate } from 'swr';
import { useCallback } from 'react';
import { formatApiPath } from '../../../../utils/format-path';
import handleErrorResponses from '../httpErrorResponseHandler';
import { IFeatureMetricsRaw } from '../../../../interfaces/featureToggle';

const PATH = formatApiPath('api/admin/client-metrics/features');

interface IUseFeatureMetricsRawOutput {
    featureMetrics?: Readonly<IFeatureMetricsRaw[]>;
    refetchFeatureMetrics: () => void;
    loading: boolean;
    error?: Error;
}

interface IUseFeatureMetricsRawResponse {
    data: IFeatureMetricsRaw[];
}

export const useFeatureMetricsRaw = (
    featureId: string,
    hoursBack: number
): IUseFeatureMetricsRawOutput => {
    const path = formatApiPath(
        `api/admin/client-metrics/features/${featureId}/raw?hoursBack=${hoursBack}`
    );

    const { data, error } = useSWR(path, () => {
        return fetchFeatureMetricsRaw(path);
    });

    const refetchFeatureMetricsRaw = useCallback(() => {
        mutate(PATH).catch(console.warn);
    }, []);

    return {
        featureMetrics: data?.data,
        loading: !error && !data,
        refetchFeatureMetrics: refetchFeatureMetricsRaw,
        error,
    };
};

const fetchFeatureMetricsRaw = (
    path: string
): Promise<IUseFeatureMetricsRawResponse> => {
    return fetch(path)
        .then(handleErrorResponses('Features'))
        .then(res => res.json())
        .then();
};
