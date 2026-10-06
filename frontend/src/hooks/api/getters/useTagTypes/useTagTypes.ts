import useSWR, { mutate, type SWRConfiguration } from 'swr';
import { useState, useEffect } from 'react';
import { formatApiPath } from 'utils/formatPath';
import type { ITagType } from 'interfaces/tags';
import type { TagTypeWithUsageSchema } from 'openapi';
import handleErrorResponses from '../httpErrorResponseHandler.js';

type TagTypeWithUsage = ITagType &
    Pick<TagTypeWithUsageSchema, 'usedInProjects' | 'valueCount'>;

const KEY = `api/admin/tag-types`;

export const refetchTagTypes = () => mutate(KEY);

const useTagTypes = (options: SWRConfiguration = {}) => {
    const fetcher = async () => {
        const path = formatApiPath(`api/admin/tag-types`);
        const res = await fetch(path, {
            method: 'GET',
        }).then(handleErrorResponses('Tag types'));
        return res.json();
    };

    const { data, error } = useSWR(KEY, fetcher, options);
    const [loading, setLoading] = useState(!error && !data);

    useEffect(() => {
        setLoading(!error && !data);
    }, [data, error]);

    return {
        tagTypes: (data?.tagTypes as TagTypeWithUsage[]) || [],
        error,
        loading,
        refetch: refetchTagTypes,
    };
};

export default useTagTypes;
