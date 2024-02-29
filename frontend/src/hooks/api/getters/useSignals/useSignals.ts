import useSWRInfinite, {
    SWRInfiniteConfiguration,
    SWRInfiniteKeyLoader,
} from 'swr/infinite';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import useUiConfig from '../useUiConfig/useUiConfig';
import { ISignal } from 'interfaces/signal';
import { useUiFlag } from 'hooks/useUiFlag';

// TODO: update endpoint
const ENDPOINT = 'api/admin/incoming-webhooks';

// TODO: rename property to signals
type SignalsResponse = {
    incomingWebhookEvents: ISignal[];
};

const fetcher = async (url: string) => {
    const response = await fetch(url);
    await handleErrorResponses('Signals')(response);
    return response.json();
};

export const useSignals = (
    signalEndpointId?: number,
    limit = 50,
    options: SWRInfiniteConfiguration = {},
) => {
    const { isEnterprise } = useUiConfig();
    const signalsEnabled = useUiFlag('signals');

    const getKey: SWRInfiniteKeyLoader = (
        pageIndex: number,
        previousPageData: SignalsResponse,
    ) => {
        // Does not meet conditions
        if (!signalEndpointId || !isEnterprise || !signalsEnabled) return null;

        // Reached the end
        if (previousPageData && !previousPageData.incomingWebhookEvents.length)
            return null;

        return formatApiPath(
            `${ENDPOINT}/${signalEndpointId}/events?limit=${limit}&offset=${
                pageIndex * limit
            }`,
        );
    };

    const { data, error, size, setSize, mutate } =
        useSWRInfinite<SignalsResponse>(getKey, fetcher, {
            ...options,
            revalidateAll: true,
        });

    const signals = data
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
        signals,
        hasMore,
        loadMore,
        loading,
        refetch: () => mutate(),
        error,
    };
};
