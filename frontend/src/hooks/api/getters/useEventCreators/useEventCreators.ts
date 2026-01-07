import { fetcher, useApiGetter } from '../useApiGetter/useApiGetter.js';
import { formatApiPath } from 'utils/formatPath';
import type { EventCreatorsSchema } from 'openapi';

export const useEventCreators = () => {
    const PATH = `api/admin/event-creators`;
    const { data, refetch, loading, error } = useApiGetter<EventCreatorsSchema>(
        formatApiPath(PATH),
        () => fetcher(formatApiPath(PATH), 'Event creators'),
    );

    return { eventCreators: data || [], refetch, error, loading };
};
