import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import type { TagValuesUsageSchema } from 'openapi';
import handleErrorResponses from '../httpErrorResponseHandler.js';

const SERVER_MAX_LIMIT = 1000;

export const useTagValues = (tagType: string) => {
    const key = `api/admin/tag-types/${encodeURIComponent(tagType)}/values?limit=${SERVER_MAX_LIMIT}`;
    const fetcher = async (): Promise<TagValuesUsageSchema> => {
        const res = await fetch(formatApiPath(key), {
            method: 'GET',
        }).then(handleErrorResponses('Tag values'));
        return res.json();
    };

    const { data, error, isLoading, mutate } = useSWR(key, fetcher);

    return {
        tagValues: data?.tagValues ?? [],
        total: data?.total ?? 0,
        error,
        loading: isLoading,
        refetch: mutate,
    };
};
