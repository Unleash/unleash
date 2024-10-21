import type { IPersonalDashboardProjectDetailsOutput } from 'hooks/api/getters/usePersonalDashboard/usePersonalDashboardProjectDetails';
import type { PersonalDashboardProjectDetailsSchema } from 'openapi';

export type RemoteData<T> =
    | { state: 'error'; error: Error }
    | { state: 'loading' }
    | { state: 'success'; data: T };

export const fromPersonalDashboardProjectDetailsOutput = ({
    personalDashboardProjectDetails,
    error,
}: IPersonalDashboardProjectDetailsOutput): RemoteData<PersonalDashboardProjectDetailsSchema> => {
    const converted = error
        ? {
              state: 'error',
              error,
          }
        : personalDashboardProjectDetails
          ? {
                state: 'success',
                data: personalDashboardProjectDetails,
            }
          : {
                state: 'loading' as const,
            };

    return converted as RemoteData<PersonalDashboardProjectDetailsSchema>;
};
