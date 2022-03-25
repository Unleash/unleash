import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';
import { IFeatureType } from '../../../../interfaces/featureTypes';
import handleErrorResponses from '../httpErrorResponseHandler';

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
        featureTypes: (data?.types as IFeatureType[]) || [],
        error,
        loading,
        refetch,
    };
};

export default useFeatureTypes;
