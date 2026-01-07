import { formatApiPath } from 'utils/formatPath';
import handleErrorResponses from '../httpErrorResponseHandler.js';
import type { PersonalDashboardProjectDetailsSchema } from 'openapi';
import { useConditionalSWR } from '../useConditionalSWR/useConditionalSWR.js';

export interface IPersonalDashboardProjectDetailsOutput {
    personalDashboardProjectDetails?: PersonalDashboardProjectDetailsSchema;
    refetch: () => void;
    loading: boolean;
    error?: Error;
}

export const usePersonalDashboardProjectDetails = (
    project?: string,
): IPersonalDashboardProjectDetailsOutput => {
    const { data, error, mutate } = useConditionalSWR(
        Boolean(project),
        {
            latestEvents: [],
            onboardingStatus: {
                status: 'onboarding-started',
            },
            owners: [],
            roles: [],
        },
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
