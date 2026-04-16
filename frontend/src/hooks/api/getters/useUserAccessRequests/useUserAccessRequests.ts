import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import type {
    UserAccessRequestSchema,
    UserAccessRequestsSchema,
} from 'openapi';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR.js';
import useUiConfig from '../useUiConfig/useUiConfig.js';

interface IUseUserAccessRequestsOutput {
    accessRequests: UserAccessRequestSchema[];
    refetchAccessRequests: () => void;
    loading: boolean;
    error?: Error;
}

export const useUserAccessRequests = (): IUseUserAccessRequestsOutput => {
    const { isOss } = useUiConfig();
    const { data, error, mutate } = useConditionalSWR<UserAccessRequestsSchema>(
        !isOss(),
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
