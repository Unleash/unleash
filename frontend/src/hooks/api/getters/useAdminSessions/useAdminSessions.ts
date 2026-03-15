import useSWR from 'swr';
import { useMemo } from 'react';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';

export interface IAdminSession {
    id: string;
    userId: number;
    userName: string | null;
    userEmail: string | null;
    imageUrl: string | null;
    seenAt: string | null;
    userAgent: string | null;
    ipAddress: string | null;
    createdAt: string;
    expired: string;
}

interface IUseAdminSessionsOutput {
    sessions: IAdminSession[];
    loading: boolean;
    refetch: () => void;
    error?: Error;
}

const fetcher = (path: string) =>
    fetch(path)
        .then(handleErrorResponses('Sessions'))
        .then((res) => res.json());

export const useAdminSessions = (): IUseAdminSessionsOutput => {
    const { data, error, mutate } = useSWR(
        formatApiPath('api/admin/sessions'),
        fetcher,
    );

    return useMemo(
        () => ({
            sessions: data?.sessions ?? [],
            loading: !error && !data,
            refetch: () => mutate(),
            error,
        }),
        [data, error, mutate],
    );
};
