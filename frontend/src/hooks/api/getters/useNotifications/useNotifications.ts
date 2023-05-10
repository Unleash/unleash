import useSWR, { SWRConfiguration } from 'swr';
import { useCallback } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import { NotificationsSchema } from 'openapi';

export const useNotifications = (options: SWRConfiguration = {}) => {
    const path = formatApiPath(`api/admin/notifications`);
    const { data, error, mutate } = useSWR<NotificationsSchema>(
        path,
        fetcher,
        options
    );

    const refetchNotifications = useCallback(() => {
        mutate().catch(console.warn);
    }, [mutate]);

    return {
        notifications: data,
        error,
        loading: !error && !data,
        refetchNotifications,
        mutateNotifications: mutate,
    };
};

const fetcher = async (path: string): Promise<NotificationsSchema> => {
    const res = await fetch(path).then(handleErrorResponses('Notifications'));
    const data = await res.json();
    return data;
};
