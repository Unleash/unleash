import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR';
import useUiConfig from '../useUiConfig/useUiConfig';
import { IIncomingWebhook } from 'interfaces/incomingWebhook';
import { useUiFlag } from 'hooks/useUiFlag';

const ENDPOINT = 'api/admin/incoming-webhooks';

const DEFAULT_DATA = {
    incomingWebhooks: [],
};

export const useIncomingWebhooks = () => {
    const { isEnterprise } = useUiConfig();
    const incomingWebhooksEnabled = useUiFlag('incomingWebhooks');

    const { data, error, mutate } = useConditionalSWR<{
        incomingWebhooks: IIncomingWebhook[];
    }>(
        isEnterprise() && incomingWebhooksEnabled,
        DEFAULT_DATA,
        formatApiPath(ENDPOINT),
        fetcher,
    );

    return useMemo(
        () => ({
            incomingWebhooks: data?.incomingWebhooks ?? [],
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate],
    );
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Incoming webhooks'))
        .then((res) => res.json());
};
