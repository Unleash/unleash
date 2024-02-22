import useSWRInfinite, {
    SWRInfiniteConfiguration,
    SWRInfiniteKeyLoader,
} from 'swr/infinite';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import useUiConfig from '../useUiConfig/useUiConfig';
import { IIncomingWebhookEvent } from 'interfaces/incomingWebhook';
import { useUiFlag } from 'hooks/useUiFlag';

const ENDPOINT = 'api/admin/incoming-webhooks';

type IncomingWebhookEventsResponse = {
    incomingWebhookEvents: IIncomingWebhookEvent[];
};

const fetcher = async (url: string) => {
    const response = await fetch(url);
    await handleErrorResponses('Incoming webhook events')(response);
    return response.json();
};

export const useIncomingWebhookEvents = (
    incomingWebhookId?: number,
    limit = 50,
    options: SWRInfiniteConfiguration = {},
) => {
    const { isEnterprise } = useUiConfig();
    const incomingWebhooksEnabled = useUiFlag('incomingWebhooks');

    const getKey: SWRInfiniteKeyLoader = (
        pageIndex: number,
        previousPageData: IncomingWebhookEventsResponse,
    ) => {
        // Does not meet conditions
        if (!incomingWebhookId || !isEnterprise || !incomingWebhooksEnabled)
            return null;

        // Reached the end
        if (previousPageData && !previousPageData.incomingWebhookEvents.length)
            return null;

        return formatApiPath(
            `${ENDPOINT}/${incomingWebhookId}/events?limit=${limit}&offset=${
                pageIndex * limit
            }`,
        );
    };

    const { data, error, size, setSize, mutate } =
        useSWRInfinite<IncomingWebhookEventsResponse>(getKey, fetcher, {
            ...options,
            revalidateAll: true,
        });

    const incomingWebhookEvents = data
        ? data.flatMap(({ incomingWebhookEvents }) => incomingWebhookEvents)
        : [];

    const isLoadingInitialData = !data && !error;
    const isLoadingMore = size > 0 && !data?.[size - 1];
    const loading = isLoadingInitialData || isLoadingMore;

    const hasMore = data?.[size - 1]?.incomingWebhookEvents.length === limit;

    const loadMore = () => {
        if (loading || !hasMore) return;
        setSize(size + 1);
    };

    return {
        incomingWebhookEvents,
        hasMore,
        loadMore,
        loading,
        refetch: () => mutate(),
        error,
    };
};
