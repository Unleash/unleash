import { useCallback } from 'react';
import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import type { ScheduledSequence } from './useReleaseAgentSequences.js';

export const useReleaseAgentSequence = (id?: string) => {
    const path = id
        ? formatApiPath(`api/admin/release-agent/sequences/${id}`)
        : null;

    const { data, error, mutate } = useSWR<ScheduledSequence>(
        path,
        (p: string) =>
            fetch(p)
                .then(handleErrorResponses('Release agent sequence'))
                .then((res) => res.json()),
        {
            // Keep the detail dialog in sync with the executor tick (60s)
            // without forcing the user to refresh.
            refreshInterval: 10_000,
            revalidateOnFocus: true,
        },
    );

    const refetch = useCallback(() => {
        mutate().catch(console.warn);
    }, [mutate]);

    return {
        sequence: data,
        loading: Boolean(id) && !error && !data,
        error,
        refetch,
    };
};
