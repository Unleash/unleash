import {
    ChangeRequestState,
    ChangeRequestType,
} from 'component/changeRequest/changeRequest.types';
import { ScheduledChangeRequestViewModel } from 'hooks/api/getters/useScheduledChangeRequestsWithStrategy/useScheduledChangeRequestsWithStrategy';

export type ChangeRequestConflictCreatedData = {
    changeRequest: string;
    state: ChangeRequestState;
};

export const getChangeRequestConflictCreatedData = (
    changeRequests: ChangeRequestType[] | undefined,
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
    changeRequests: ScheduledChangeRequestViewModel[] | undefined,
    unleashInstallationIdentifier: string | undefined,
): ChangeRequestConflictCreatedData[] =>
    changeRequests?.map((cr) => ({
        changeRequest: `${unleashInstallationIdentifier}#${cr.id}`,
        state: 'Scheduled' as const,
    })) ?? [];
