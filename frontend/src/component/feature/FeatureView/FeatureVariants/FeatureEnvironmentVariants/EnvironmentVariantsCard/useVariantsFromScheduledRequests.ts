import { usePendingChangeRequestsForFeature } from '../../../../../../hooks/api/getters/usePendingChangeRequestsForFeature/usePendingChangeRequestsForFeature';

export const useVariantsFromScheduledRequests = (
    projectId: string,
    featureId: string,
    environment: string,
): number[] => {
    const { changeRequests } = usePendingChangeRequestsForFeature(
        projectId,
        featureId,
    );

    const scheduledEnvironmentRequests =
        changeRequests?.filter(
            (request) =>
                request.environment === environment &&
                request.state === 'Scheduled',
        ) || [];

    const result: number[] = [];
    if (scheduledEnvironmentRequests.length === 0) {
        return result;
    }

    scheduledEnvironmentRequests.forEach((scheduledRequest) => {
        const feature = scheduledRequest?.features.find(
            (feature) => feature.name === featureId,
        );
        const change = feature?.changes.find((change) => {
            return change.action === 'patchVariant';
        });

        if (change) {
            result.push(scheduledRequest.id);
        }
    });

    return result;
};
