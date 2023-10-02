import { FeaturesSchema } from 'openapi';
import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Feature toggle'))
        .then(res => res.json());
};

export const useFeatures = () => {
    const { data, error, mutate } = useSWR<FeaturesSchema>(
        formatApiPath('api/admin/features'),
        fetcher,
        {
            refreshInterval: 15 * 1000, // ms
        }
    );

    return {
        features: data?.features,
        loading: !error && !data,
        refetchFeatures: mutate,
        error,
    };
};
