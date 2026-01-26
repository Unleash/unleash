import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import useSWR from 'swr';
import type { EdgeObservability } from 'interfaces/connectedEdge';
import type { SWRConfiguration } from 'swr';

const DEFAULT_DATA: EdgeObservability = {
    connectedEdges: [],
    revisionIds: [],
};

export const useEdgeObservability = (options?: SWRConfiguration) => {
    const { data, error, mutate } = useSWR<EdgeObservability>(
        formatApiPath('api/admin/metrics/edges'),
        fetcher,
        options,
    );

    return useMemo(
        () => ({
            edgeObservability: data ?? DEFAULT_DATA,
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
