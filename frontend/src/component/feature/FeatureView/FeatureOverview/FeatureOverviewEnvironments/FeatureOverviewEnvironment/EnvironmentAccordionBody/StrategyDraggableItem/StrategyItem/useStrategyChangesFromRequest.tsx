import type { IFeatureChange } from 'component/changeRequest/changeRequest.types';
import { usePendingChangeRequestsForFeature } from 'hooks/api/getters/usePendingChangeRequestsForFeature/usePendingChangeRequestsForFeature';
import { useAuthUser } from 'hooks/api/getters/useAuth/useAuthUser';

export type UseStrategyChangeFromRequestResult = Array<{
    changeRequestId: number;
    change: IFeatureChange;
    isScheduledChange: boolean;
}>;
export const useStrategyChangesFromRequest = (
    projectId: string,
    featureId: string,
    environment: string,
    strategyId: string,
) => {
    const { user } = useAuthUser();

    const { changeRequests } = usePendingChangeRequestsForFeature(
        projectId,
        featureId,
    );
    const result: UseStrategyChangeFromRequestResult = [];

    const environmentDraftOrScheduled = changeRequests?.filter(
        (changeRequest) => changeRequest.environment === environment,
    );

    environmentDraftOrScheduled?.forEach((draftOrScheduled) => {
        const feature = draftOrScheduled?.features.find(
            (feature) => feature.name === featureId,
        );
        const change = feature?.changes.find((change) => {
            if (
                change.action === 'updateStrategy' ||
                change.action === 'deleteStrategy'
            ) {
                return change.payload.id === strategyId;
            }
            return false;
        });
        if (change) {
            const isScheduledChange = draftOrScheduled.state === 'Scheduled';
            const isOwnDraft =
                !isScheduledChange &&
                draftOrScheduled.createdBy.id === user?.id;

            if (isScheduledChange) {
                result.push({
                    changeRequestId: draftOrScheduled.id,
                    change,
                    isScheduledChange,
                });
            }

            if (isOwnDraft) {
                result.push({
                    changeRequestId: draftOrScheduled.id,
                    change,
                    isScheduledChange,
                });
            }
        }
    });

    return result;
};
