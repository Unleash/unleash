import useSWR, { mutate, type SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';
import type { ITag } from 'interfaces/tags';
import handleErrorResponses from '../httpErrorResponseHandler.js';

const useAllTags = (options: SWRConfiguration = {}) => {
    const fetcher = async () => {
        const path = formatApiPath(`api/admin/tags`);
        const res = await fetch(path, {
            method: 'GET',
        }).then(handleErrorResponses('Tags'));
        return res.json();
    };

    const KEY = `api/admin/tags`;

    const { data, error } = useSWR<{ tags: ITag[] }>(KEY, fetcher, options);
    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        tags: (data?.tags as ITag[]) || [],
        error,
        loading,
        refetch,
    };
};

export default useAllTags;
