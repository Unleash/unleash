import type {
    ChangeRequestState,
    ChangeRequestType,
} from 'component/changeRequest/changeRequest.types';
import type { ScheduledChangeRequestViewModel } from 'hooks/api/getters/useScheduledChangeRequestsWithStrategy/useScheduledChangeRequestsWithStrategy';
import type { IUiConfig } from 'interfaces/uiConfig';
import { getUniqueChangeRequestId } from 'utils/unique-change-request-id';

type ChangeRequestConflictCreatedData = {
    changeRequest: string;
    state: ChangeRequestState;
};

export const getChangeRequestConflictCreatedData = (
    changeRequests: ChangeRequestType[] | undefined,
    featureId: string,
    strategyId: string,
    uiConfig: Pick<IUiConfig, 'baseUriPath' | 'versionInfo'>,
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
            changeRequest: getUniqueChangeRequestId(uiConfig, cr.id),
            state: cr.state,
        })) ?? [];

export const getChangeRequestConflictCreatedDataFromScheduleData = (
    changeRequests: Pick<ScheduledChangeRequestViewModel, 'id'>[] | undefined,
    uiConfig: Pick<IUiConfig, 'baseUriPath' | 'versionInfo'>,
): ChangeRequestConflictCreatedData[] =>
    changeRequests?.map((cr) => ({
        changeRequest: getUniqueChangeRequestId(uiConfig, cr.id),
        state: 'Scheduled' as const,
    })) ?? [];
