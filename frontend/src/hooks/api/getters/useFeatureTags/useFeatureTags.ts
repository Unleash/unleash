import { mutate, type SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';
import type { ITag } from 'interfaces/tags';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR.js';

const useFeatureTags = (featureId: string, options: SWRConfiguration = {}) => {
    const fetcher = async () => {
        const path = formatApiPath(`api/admin/features/${featureId}/tags`);
        const res = await fetch(path, {
            method: 'GET',
        }).then(handleErrorResponses('Tags'));
        return res.json();
    };

    const KEY = `api/admin/features/${featureId}/tags`;

    const { data, error } = useConditionalSWR<{ tags: ITag[] }>(
        Boolean(featureId),
        { tags: [] },
        KEY,
        fetcher,
        options,
    );
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

export default useFeatureTags;
