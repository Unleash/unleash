import useSWRInfinite, {
    type SWRInfiniteConfiguration,
    type SWRInfiniteKeyLoader,
} from 'swr/infinite';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import useUiConfig from '../useUiConfig/useUiConfig.js';
import type { IActionSetEvent } from 'interfaces/action';
import { useUiFlag } from 'hooks/useUiFlag';

type ActionEventsResponse = {
    actionSetEvents: IActionSetEvent[];
};

const fetcher = async (url: string) => {
    const response = await fetch(url);
    await handleErrorResponses('Action events')(response);
    return response.json();
};

export const useActionEvents = (
    actionSetId?: number,
    projectId?: string,
    limit = 50,
    options: SWRInfiniteConfiguration = {},
) => {
    const { isEnterprise } = useUiConfig();
    const automatedActionsEnabled = useUiFlag('automatedActions');

    const getKey: SWRInfiniteKeyLoader = (
        pageIndex: number,
        previousPageData: ActionEventsResponse,
    ) => {
        // Does not meet conditions
        if (
            !actionSetId ||
            !projectId ||
            !isEnterprise ||
            !automatedActionsEnabled
        )
            return null;

        // Reached the end
        if (previousPageData && !previousPageData.actionSetEvents.length)
            return null;

        return formatApiPath(
            `api/admin/projects/${projectId}/actions/${actionSetId}/events?limit=${limit}&offset=${
                pageIndex * limit
            }`,
        );
    };

    const { data, error, size, setSize, mutate } =
        useSWRInfinite<ActionEventsResponse>(getKey, fetcher, {
            ...options,
            revalidateAll: true,
        });

    const actionEvents = data
        ? data.flatMap(({ actionSetEvents }) => actionSetEvents)
        : [];

    const isLoadingInitialData = !data && !error;
    const isLoadingMore = size > 0 && !data?.[size - 1];
    const loading = isLoadingInitialData || isLoadingMore;

    const hasMore = data?.[size - 1]?.actionSetEvents.length === limit;

    const loadMore = () => {
        if (loading || !hasMore) return;
        setSize(size + 1);
    };

    return {
        actionEvents,
        hasMore,
        loadMore,
        loading,
        refetch: () => mutate(),
        error,
    };
};
