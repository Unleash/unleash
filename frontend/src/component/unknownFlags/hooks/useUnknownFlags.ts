import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from 'hooks/api/getters/httpErrorResponseHandler';
import type { SWRConfiguration } from 'swr';
import useSWR from 'swr';

type UnknownFlagEnvReport = {
    environment: string;
    seenAt: Date;
};

type UnknownFlagAppReport = {
    appName: string;
    environments: UnknownFlagEnvReport[];
};

export type UnknownFlag = {
    name: string;
    lastSeenAt: Date;
    lastEventAt?: Date;
    reports: UnknownFlagAppReport[];
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
        options,
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
