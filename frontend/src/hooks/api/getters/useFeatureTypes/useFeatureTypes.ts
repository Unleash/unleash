import useSWR, { mutate, type SWRConfiguration } from 'swr';
import { useEffect, useState } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import type { FeatureTypeSchema } from 'openapi';

const useFeatureTypes = (options: SWRConfiguration = {}) => {
    const fetcher = async () => {
        const path = formatApiPath(`api/admin/feature-types`);
        const res = await fetch(path, {
            method: 'GET',
        }).then(handleErrorResponses('Feature types'));
        return res.json();
    };

    const KEY = `api/admin/feature-types`;

    const { data, error } = useSWR(KEY, fetcher, options);
    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        featureTypes: (data?.types as FeatureTypeSchema[]) || [],
        error,
        loading,
        refetch,
    };
};

export default useFeatureTypes;
