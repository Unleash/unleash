import useSWR from 'swr';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';

export interface IUserAccessRequest {
    id: string;
    email: string;
    imageUrl: string;
    requestedAt: string;
}

interface IUseUserAccessRequestsOutput {
    accessRequests: IUserAccessRequest[];
    refetchAccessRequests: () => void;
    loading: boolean;
    error?: Error;
}

export const useUserAccessRequests = (): IUseUserAccessRequestsOutput => {
    const { data, error, mutate } = useSWR(
        formatApiPath('api/admin/user-access-requests'),
        fetcher,
    );

    return useMemo(
        () => ({
            accessRequests: data?.userAccessRequests ?? [],
            error,
            refetchAccessRequests: () => mutate(),
            loading: !error && !data,
        }),
        [data, error, mutate],
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('UserAccessRequests'))
        .then((res) => res.json());
};
