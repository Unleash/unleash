import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';
import { ITagType } from 'interfaces/tags';
import handleErrorResponses from '../httpErrorResponseHandler';

const useTagTypes = (options: SWRConfiguration = {}) => {
    const fetcher = async () => {
        const path = formatApiPath(`api/admin/tag-types`);
        const res = await fetch(path, {
            method: 'GET',
        }).then(handleErrorResponses('Tag types'));
        return res.json();
    };

    const KEY = `api/admin/tag-types`;

    const { data, error } = useSWR(KEY, fetcher, options);
    const [loading, setLoading] = useState(!error && !data);

    const refetch = () => {
        mutate(KEY);
    };

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        tagTypes: (data?.tagTypes as ITagType[]) || [],
        error,
        loading,
        refetch,
    };
};

export default useTagTypes;
