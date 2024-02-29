import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR';
import useUiConfig from '../useUiConfig/useUiConfig';
import { ISignalEndpointToken } from 'interfaces/signal';
import { useUiFlag } from 'hooks/useUiFlag';

// TODO: update endpoint and incomingWebhookTokens property
const ENDPOINT = 'api/admin/incoming-webhooks';

export const useSignalEndpointTokens = (signalEndpointId: number) => {
    const { isEnterprise } = useUiConfig();
    const signalsEnabled = useUiFlag('signals');

    const { data, error, mutate } = useConditionalSWR(
        isEnterprise() && signalsEnabled,
        { incomingWebhookTokens: [] },
        formatApiPath(`${ENDPOINT}/${signalEndpointId}/tokens`),
        fetcher,
    );

    return useMemo(
        () => ({
            signalEndpointTokens: (data?.incomingWebhookTokens ??
                []) as ISignalEndpointToken[],
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate],
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Signal endpoint tokens'))
        .then((res) => res.json());
};
