import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR.js';
import type { ConnectedEdge } from 'interfaces/connectedEdge';
import type { SWRConfiguration } from 'swr';
import { useUiFlag } from 'hooks/useUiFlag';

const DEFAULT_DATA: ConnectedEdge[] = [];

export const useConnectedEdges = (options?: SWRConfiguration) => {
    const edgeObservabilityEnabled = useUiFlag('edgeObservability');

    const { data, error, mutate } = useConditionalSWR<ConnectedEdge[]>(
        edgeObservabilityEnabled,
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
