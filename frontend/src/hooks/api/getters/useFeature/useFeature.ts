import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useCallback } from 'react';
import { emptyFeature } from './emptyFeature';
import handleErrorResponses from '../httpErrorResponseHandler';
import { formatApiPath } from 'utils/formatPath';
import { IFeatureToggle } from 'interfaces/featureToggle';

interface IUseFeatureOutput {
    feature: IFeatureToggle;
    refetchFeature: () => void;
    loading: boolean;
    status?: number;
    error?: Error;
}

interface IFeatureResponse {
    status: number;
    body?: IFeatureToggle;
}

export const useFeature = (
    projectId: string,
    featureId: string,
    options?: SWRConfiguration
): IUseFeatureOutput => {
    const path = formatApiPath(
        `api/admin/projects/${projectId}/features/${featureId}`
    );

    const { data, error } = useSWR<IFeatureResponse>(
        path,
        () => fetcher(path),
        options
    );

    const refetchFeature = useCallback(() => {
        mutate(path).catch(console.warn);
    }, [path]);

    return {
        feature: data?.body || emptyFeature,
        refetchFeature,
        loading: !error && !data,
        status: data?.status,
        error,
    };
};

const fetcher = async (path: string): Promise<IFeatureResponse> => {
    const res = await fetch(path);

    if (res.status === 404) {
        return { status: 404 };
    }

    if (!res.ok) {
        await handleErrorResponses('Feature toggle data')(res);
    }

    return {
        status: res.status,
        body: await res.json(),
    };
};
