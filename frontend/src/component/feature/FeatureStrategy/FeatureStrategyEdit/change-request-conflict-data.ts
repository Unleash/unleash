import {
    ChangeRequestState,
    ChangeRequestType,
    IChangeRequestFeature,
    IFeatureChange,
} from 'component/changeRequest/changeRequest.types';
import { ScheduledChangeRequestViewModel } from 'hooks/api/getters/useScheduledChangeRequestsWithStrategy/useScheduledChangeRequestsWithStrategy';
import { IUiConfig } from 'interfaces/uiConfig';
import { getUniqueChangeRequestId } from 'utils/unique-change-request-id';

type ChangeRequestConflictCreatedData = {
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
                      payload: { id?: number | string };
                  })[];
              }[];
          }[]
        | undefined,
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
