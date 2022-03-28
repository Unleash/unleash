import useSWR, { mutate, SWRConfiguration } from 'swr';
import { useCallback } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { IEvent } from 'interfaces/event';

const PATH = formatApiPath('api/admin/events');

export interface IUseEventsOutput {
    events: IEvent[];
    refetchEvents: () => void;
    loading: boolean;
    error?: Error;
}

export const useEvents = (options?: SWRConfiguration): IUseEventsOutput => {
    const { data, error } = useSWR<{ events: IEvent[] }>(
        PATH,
        fetchAllEvents,
        options
    );

    const refetchEvents = useCallback(() => {
        mutate(PATH).catch(console.warn);
    }, []);

    return {
        events: data?.events || [],
        loading: !error && !data,
        refetchEvents,
        error,
    };
};

const fetchAllEvents = () => {
    return fetch(PATH, { method: 'GET' })
        .then(handleErrorResponses('Event history'))
        .then(res => res.json());
};
