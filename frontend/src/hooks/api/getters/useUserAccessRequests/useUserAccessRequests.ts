import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import type {
    UserAccessRequestSchema,
    UserAccessRequestsSchema,
} from 'openapi';
import { useEnterpriseSWR } from '../useEnterpriseSWR/useEnterpriseSWR.js';

interface IUseUserAccessRequestsOutput {
    accessRequests: UserAccessRequestSchema[];
    refetchAccessRequests: () => void;
    loading: boolean;
    error?: Error;
}

export const useUserAccessRequests = (): IUseUserAccessRequestsOutput => {
    const { data, error, mutate } = useEnterpriseSWR<UserAccessRequestsSchema>(
        { userAccessRequests: [] },
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
