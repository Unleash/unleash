import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from '../../../../utils/format-path';
import handleErrorResponses from '../httpErrorResponseHandler';

const useTagType = (name: string, options: SWRConfiguration = {}) => {
    const fetcher = async () => {
        const path = formatApiPath(`api/admin/tag-types/${name}`);
        return fetch(path, {
            method: 'GET',
        })
            .then(handleErrorResponses('Tag data'))
            .then(res => res.json());
    };

    const FEATURE_CACHE_KEY = `api/admin/tag-types/${name}`;

    const { data, error } = useSWR(FEATURE_CACHE_KEY, fetcher, {
        ...options,
    });

    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(FEATURE_CACHE_KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        tagType: data?.tagType || { name: '', description: '' },
        error,
        loading,
        refetch,
        FEATURE_CACHE_KEY,
    };
};

export default useTagType;
