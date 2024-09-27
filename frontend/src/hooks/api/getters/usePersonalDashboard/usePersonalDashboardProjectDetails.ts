import useSWR from 'swr';
import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler';
import type { PersonalDashboardProjectDetailsSchema } from 'openapi';

export interface IPersonalDashboardProjectDetailsOutput {
    personalDashboardProjectDetails?: PersonalDashboardProjectDetailsSchema;
    refetch: () => void;
    loading: boolean;
    error?: Error;
}

export const usePersonalDashboardProjectDetails = (
    project: string,
): IPersonalDashboardProjectDetailsOutput => {
    const { data, error, mutate } = useSWR(
        formatApiPath(`api/admin/personal-dashboard/${project}`),
        fetcher,
    );

    return {
        personalDashboardProjectDetails: data,
        loading: !error && !data,
        refetch: () => mutate(),
        error,
    };
};

const fetcher = (path: string) => {
    return fetch(path)
        .then(handleErrorResponses('Personal Dashboard Project Details'))
        .then((res) => res.json());
};
