import {
    ChangeRequestState,
    ChangeRequestType,
    IChangeRequestFeature,
    IFeatureChange,
} from 'component/changeRequest/changeRequest.types';
import { ScheduledChangeRequestViewModel } from 'hooks/api/getters/useScheduledChangeRequestsWithStrategy/useScheduledChangeRequestsWithStrategy';

export type ChangeRequestConflictCreatedData = {
    changeRequest: string;
    state: ChangeRequestState;
};

export const getChangeRequestConflictCreatedData = (
    changeRequests:
        | {
              state: ChangeRequestType['state'];
              id: ChangeRequestType['id'];
              features: {
                  name: IChangeRequestFeature['name'];
                  changes: (Pick<IFeatureChange, 'action'> & {
                      payload: { id?: number };
                  })[];
              }[];
          }[]
        | undefined,
    featureId: string,
    strategyId: string,
    unleashInstallationIdentifier: string | undefined,
): ChangeRequestConflictCreatedData[] =>
    changeRequests
        ?.filter((cr) =>
            cr.features
                .find((feature) => feature.name === featureId)
                ?.changes.some(
                    (change) =>
                        change.action === 'updateStrategy' &&
                        change.payload.id === strategyId,
                ),
        )
        .map((cr) => ({
            changeRequest: `${unleashInstallationIdentifier}#${cr.id}`,
            state: cr.state,
        })) ?? [];

export const getChangeRequestConflictCreatedDataFromScheduleData = (
    changeRequests: Pick<ScheduledChangeRequestViewModel, 'id'>[] | undefined,
    unleashInstallationIdentifier: string | undefined,
): ChangeRequestConflictCreatedData[] =>
    changeRequests?.map((cr) => ({
        changeRequest: `${unleashInstallationIdentifier}#${cr.id}`,
        state: 'Scheduled' as const,
    })) ?? [];
