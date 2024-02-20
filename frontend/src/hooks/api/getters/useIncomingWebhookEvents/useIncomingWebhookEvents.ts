import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR';
import useUiConfig from '../useUiConfig/useUiConfig';
import { IIncomingWebhookEvent } from 'interfaces/incomingWebhook';
import { useUiFlag } from 'hooks/useUiFlag';

const ENDPOINT = 'api/admin/incoming-webhooks';

const DEFAULT_DATA = {
    incomingWebhookEvents: [],
};

export const useIncomingWebhookEvents = (
    incomingWebhookId?: number,
    limit = 50,
    offset = 0,
) => {
    const { isEnterprise } = useUiConfig();
    const incomingWebhooksEnabled = useUiFlag('incomingWebhooks');

    const { data, error, mutate } = useConditionalSWR<{
        incomingWebhookEvents: IIncomingWebhookEvent[];
    }>(
        Boolean(incomingWebhookId) && isEnterprise() && incomingWebhooksEnabled,
        DEFAULT_DATA,
        formatApiPath(
            `${ENDPOINT}/${incomingWebhookId}/events?limit=${limit}&offset=${offset}`,
        ),
        fetcher,
    );

    return useMemo(
        () => ({
            incomingWebhookEvents: data?.incomingWebhookEvents ?? [],
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate],
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Incoming webhook events'))
        .then((res) => res.json());
};
