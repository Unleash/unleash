import { useCallback } from 'react';
import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import type { GetUserRecentFlagsParams, UserRecentFlagsSchema } from 'openapi';

export const useUserRecentFlags = (params: GetUserRecentFlagsParams) => {
    const query = new URLSearchParams(params).toString();
    const { data, error, mutate } = useSWR<UserRecentFlagsSchema>(
        formatApiPath(`api/admin/user/recent-flags?${query}`),
        fetcher,
    );

    const refetch = useCallback(() => mutate(), [mutate]);

    return {
        flags: data?.flags,
        loading: !error && !data,
        refetch,
        error,
    };
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('User recent flags'))
        .then((res) => res.json());
};
