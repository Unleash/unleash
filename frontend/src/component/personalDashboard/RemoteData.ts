import type { IPersonalDashboardProjectDetailsOutput } from 'hooks/api/getters/usePersonalDashboard/usePersonalDashboardProjectDetails';
import type { PersonalDashboardProjectDetailsSchema } from 'openapi';
import type { RemoteData } from 'hooks/api/RemoteData';

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
