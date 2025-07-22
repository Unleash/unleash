import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import useSWR, { type SWRConfiguration } from 'swr';
import handleErrorResponses from 'hooks/api/getters/httpErrorResponseHandler';

export type UnknownFlag = {
    name: string;
    appName: string;
    seenAt: Date;
    environment: string;
};

type UnknownFlagsResponse = {
    unknownFlags: UnknownFlag[];
};

const ENDPOINT = 'api/admin/metrics/unknown-flags';
const DEFAULT_DATA: UnknownFlagsResponse = {
    unknownFlags: [],
};

export const useUnknownFlags = (options?: SWRConfiguration) => {
    const { data, error, mutate } = useSWR<UnknownFlagsResponse>(
        formatApiPath(ENDPOINT),
        fetcher,
        {
            fallbackData: DEFAULT_DATA,
            ...options,
        },
    );

    return useMemo(
        () => ({
            unknownFlags: (data || DEFAULT_DATA).unknownFlags,
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate],
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Unknown Flags'))
        .then((res) => res.json());
};
