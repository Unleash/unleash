import useSWR from 'swr';
import { useCallback, useState, useEffect, useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { IEvent } from 'interfaces/event';

const PATH = formatApiPath('api/admin/events/search');

export interface IUseEventSearchOutput {
    events?: IEvent[];
    fetchNextPage: () => void;
    loading: boolean;
    totalEvents?: number;
    error?: Error;
}

interface IEventSearch {
    type?: string;
    project?: string;
    feature?: string;
    query?: string;
    limit?: number;
    offset?: number;
}

export const useEventSearch = (
    project?: string,
    feature?: string,
    query?: string
): IUseEventSearchOutput => {
    const [events, setEvents] = useState<IEvent[]>();
    const [totalEvents, setTotalEvents] = useState<number>(0);
    const [offset, setOffset] = useState(0);

    const search: IEventSearch = useMemo(
        () => ({ project, feature, query, limit: 50 }),
        [project, feature, query]
    );

    const { data, error, isValidating } = useSWR<{
        events: IEvent[];
        totalEvents?: number;
    }>([PATH, search, offset], () => searchEvents(PATH, { ...search, offset }));

    // Reset the page when there are new search conditions.
    useEffect(() => {
        setOffset(0);
        setTotalEvents(0);
        setEvents(undefined);
    }, [search]);

    // Append results to the page when more data has been fetched.
    useEffect(() => {
        if (data) {
            setEvents(prev => [...(prev ?? []), ...data.events]);
            if (data.totalEvents) {
                setTotalEvents(data.totalEvents);
            }
        }
    }, [data]);

    // Update the offset to fetch more results at the end of the page.
    const fetchNextPage = useCallback(() => {
        if (events && !isValidating) {
            setOffset(events.length);
        }
    }, [events, isValidating]);

    return {
        events,
        loading: !error && !data,
        fetchNextPage,
        totalEvents,
        error,
    };
};

const searchEvents = (path: string, search: IEventSearch) => {
    return fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(search),
    })
        .then(handleErrorResponses('Event history'))
        .then(res => res.json());
};
