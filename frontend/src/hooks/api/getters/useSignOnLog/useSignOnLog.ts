import { ISignOnEvent } from 'interfaces/signOnEvent';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR';
import useUiConfig from '../useUiConfig/useUiConfig';

export const useSignOnLog = () => {
    const { uiConfig, isEnterprise } = useUiConfig();

    const { loginEventLog } = uiConfig.flags;

    const { data, error, mutate } = useConditionalSWR(
        loginEventLog && isEnterprise(),
        [],
        formatApiPath(`api/admin/login-event`),
        fetcher
    );

    return useMemo(
        () => ({
            events: (data ?? []) as ISignOnEvent[],
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate]
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Sign-On Log'))
        .then(res => res.json());
};
