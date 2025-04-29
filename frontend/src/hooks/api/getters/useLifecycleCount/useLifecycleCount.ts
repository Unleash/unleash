import { formatApiPath } from 'utils/formatPath';
import useSWR from 'swr';
import type { FeatureLifecycleCountSchema } from 'openapi';
import handleErrorResponses from '../httpErrorResponseHandler.js';

export const useLifecycleCount = () => {
    const { data, error } = useSWR<FeatureLifecycleCountSchema>(
        formatApiPath('api/admin/lifecycle/count'),
        fetcher,
    );

    return {
        lifecycleCount: data,
        error,
        loading: !error && !data,
    };
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Lifecycle count'))
        .then((res) => res.json());
};
