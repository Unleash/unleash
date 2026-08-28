import type { IActiveSession } from 'interfaces/activeSession';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR.js';
import useUiConfig from '../useUiConfig/useUiConfig.js';

export const useActiveSessions = () => {
    const { isEnterprise, uiConfig } = useUiConfig();
    const enabled = isEnterprise() && Boolean(uiConfig.flags.sessionInspector);

    const { data, error, mutate } = useConditionalSWR(
        enabled,
        { sessions: [] },
        formatApiPath(`api/admin/user-sessions`),
        fetcher,
    );

    return useMemo(
        () => ({
            sessions: (data?.sessions ?? []) as IActiveSession[],
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate],
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Active sessions'))
        .then((res) => res.json());
};
