import { useContext } from 'react';
import useSWRInfinite, {
    type SWRInfiniteConfiguration,
    type SWRInfiniteKeyLoader,
} from 'swr/infinite';
import { formatApiPath } from 'utils/formatPath';
import type { IntegrationEvents } from 'interfaces/integrationEvent';
import AccessContext from 'contexts/AccessContext';
import handleErrorResponses from '../httpErrorResponseHandler.js';

const fetcher = async (url: string) => {
    const response = await fetch(url);
    await handleErrorResponses('Integration events')(response);
    return response.json();
};

export const useIntegrationEvents = (
    integrationId?: number,
    limit = 50,
    options: SWRInfiniteConfiguration = {},
) => {
    const { isAdmin } = useContext(AccessContext);

    const getKey: SWRInfiniteKeyLoader = (
        pageIndex: number,
        previousPageData: IntegrationEvents,
    ) => {
        // Does not meet conditions
        if (!integrationId || !isAdmin) return null;

        // Reached the end
        if (previousPageData && !previousPageData.integrationEvents.length)
            return null;

        return formatApiPath(
            `api/admin/addons/${integrationId}/events?limit=${limit}&offset=${
                pageIndex * limit
            }`,
        );
    };

    const { data, error, size, setSize, mutate } =
        useSWRInfinite<IntegrationEvents>(getKey, fetcher, {
            ...options,
            revalidateAll: true,
        });

    const integrationEvents = data
        ? data.flatMap(({ integrationEvents }) => integrationEvents)
        : [];

    const isLoadingInitialData = !data && !error;
    const isLoadingMore = size > 0 && !data?.[size - 1];
    const loading = isLoadingInitialData || isLoadingMore;

    const hasMore = data?.[size - 1]?.integrationEvents.length === limit;

    const loadMore = () => {
        if (loading || !hasMore) return;
        setSize(size + 1);
    };

    return {
        integrationEvents,
        hasMore,
        loadMore,
        loading,
        refetch: () => mutate(),
        error,
    };
};
