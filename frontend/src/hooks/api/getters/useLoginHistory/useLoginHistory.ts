import { ILoginEvent } from 'interfaces/loginEvent';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR';
import useUiConfig from '../useUiConfig/useUiConfig';

export const useLoginHistory = () => {
    const { uiConfig, isEnterprise } = useUiConfig();

    const { loginHistory } = uiConfig.flags;

    const { data, error, mutate } = useConditionalSWR(
        loginHistory && isEnterprise(),
        { events: [] },
        formatApiPath(`api/admin/logins`),
        fetcher
    );

    return useMemo(
        () => ({
            events: (data?.events ?? []) as ILoginEvent[],
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate]
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Login History'))
        .then(res => res.json());
};
