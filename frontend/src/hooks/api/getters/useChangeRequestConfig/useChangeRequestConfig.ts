import useSWR, { BareFetcher, Key, SWRResponse } from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { IChangeRequestEnvironmentConfig } from 'component/changeRequest/changeRequest.types';
import useUiConfig from '../useUiConfig/useUiConfig';
import { useEffect } from 'react';

const useConditionalSWR = <Data = any, Error = any, T = boolean>(
    key: Key,
    fetcher: BareFetcher<Data> | null,
    condition: T
): SWRResponse<Data, Error> => {
    const result = useSWR(key, fetcher);

    useEffect(() => {
        result.mutate();
    }, [condition]);

    return result;
};

export const useChangeRequestConfig = (projectId: string) => {
    const { isOss } = useUiConfig();

    const { data, error, mutate } = useConditionalSWR<
        IChangeRequestEnvironmentConfig[]
    >(
        formatApiPath(`api/admin/projects/${projectId}/change-requests/config`),
        (path: string) => (isOss() ? Promise.resolve([]) : fetcher(path)),
        isOss()
    );

    return {
        data: data || [],
        loading: !error && !data,
        refetchChangeRequestConfig: mutate,
        error,
    };
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Request changes'))
        .then(res => res.json());
};
