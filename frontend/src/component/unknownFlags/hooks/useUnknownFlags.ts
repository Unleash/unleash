import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import { useUiFlag } from 'hooks/useUiFlag.js';
import { useConditionalSWR } from 'hooks/api/getters/useConditionalSWR/useConditionalSWR.js';
import handleErrorResponses from 'hooks/api/getters/httpErrorResponseHandler';
import type { SWRConfiguration } from 'swr';

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
    const reportUnknownFlagsEnabled = useUiFlag('reportUnknownFlags');

    const { data, error, mutate } = useConditionalSWR<UnknownFlagsResponse>(
        reportUnknownFlagsEnabled,
        DEFAULT_DATA,
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
