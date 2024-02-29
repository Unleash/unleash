import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR';
import useUiConfig from '../useUiConfig/useUiConfig';
import { ISignalEndpoint } from 'interfaces/signal';
import { useUiFlag } from 'hooks/useUiFlag';

// TODO: Update endpoint and incomingWebhooks property
const ENDPOINT = 'api/admin/incoming-webhooks';

const DEFAULT_DATA = {
    incomingWebhooks: [],
};

export const useSignalEndpoints = () => {
    const { isEnterprise } = useUiConfig();
    const signalsEnabled = useUiFlag('signals');

    const { data, error, mutate } = useConditionalSWR<{
        incomingWebhooks: ISignalEndpoint[];
    }>(
        isEnterprise() && signalsEnabled,
        DEFAULT_DATA,
        formatApiPath(ENDPOINT),
        fetcher,
    );

    return useMemo(
        () => ({
            signalEndpoints: data?.incomingWebhooks ?? [],
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate],
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Signal endpoints'))
        .then((res) => res.json());
};
