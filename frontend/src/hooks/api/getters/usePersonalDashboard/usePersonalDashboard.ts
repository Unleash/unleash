import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import type { PersonalDashboardSchema } from 'openapi';

export interface IPersonalDashboardOutput {
    personalDashboard?: PersonalDashboardSchema;
    refetch: () => void;
    loading: boolean;
    error?: Error;
}

export const usePersonalDashboard = (): IPersonalDashboardOutput => {
    const { data, error, mutate } = useSWR(
        formatApiPath('api/admin/personal-dashboard'),
        fetcher,
    );

    return {
        personalDashboard: data,
        loading: !error && !data,
        refetch: () => mutate(),
        error,
    };
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Personal Dashboard'))
        .then((res) => res.json());
};
