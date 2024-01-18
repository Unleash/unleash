import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR';
import useUiConfig from '../useUiConfig/useUiConfig';
import { IIncomingWebhookToken } from 'interfaces/incomingWebhook';
import { useUiFlag } from 'hooks/useUiFlag';

const ENDPOINT = 'api/admin/incoming-webhooks';

export const useIncomingWebhookTokens = (incomingWebhookId: number) => {
    const { isEnterprise } = useUiConfig();
    const incomingWebhooksEnabled = useUiFlag('incomingWebhooks');

    const { data, error, mutate } = useConditionalSWR(
        isEnterprise() && incomingWebhooksEnabled,
        { incomingWebhookTokens: [] },
        formatApiPath(`${ENDPOINT}/${incomingWebhookId}/tokens`),
        fetcher,
    );

    return useMemo(
        () => ({
            incomingWebhookTokens: (data?.incomingWebhookTokens ??
                []) as IIncomingWebhookToken[],
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate],
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Incoming webhook tokens'))
        .then((res) => res.json());
};
