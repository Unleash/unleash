import { useMemo } from 'react';
import useUiConfig from '../useUiConfig/useUiConfig';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR';
import type { ConnectedEdge } from 'interfaces/connectedEdge';
import type { SWRConfiguration } from 'swr';

const DEFAULT_DATA: ConnectedEdge[] = [];

export const useConnectedEdges = (options?: SWRConfiguration) => {
    const { isEnterprise } = useUiConfig();

    const { data, error, mutate } = useConditionalSWR<ConnectedEdge[]>(
        isEnterprise(),
        DEFAULT_DATA,
        formatApiPath('api/admin/metrics/edges'),
        fetcher,
        options,
    );

    return useMemo(
        () => ({
            connectedEdges: data ?? [],
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate],
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Connected Edges'))
        .then((res) => res.json());
};
