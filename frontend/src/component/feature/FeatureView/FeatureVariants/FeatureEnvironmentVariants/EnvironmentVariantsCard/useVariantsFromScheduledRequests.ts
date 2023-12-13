import { useScheduledChangeRequestsWithVariant } from 'hooks/api/getters/useScheduledChangeRequestsWithVariants/useScheduledChangeRequestsWithVariant';

export const useVariantsFromScheduledRequests = (
    projectId: string,
    featureId: string,
    environment: string,
): number[] => {
    const { changeRequests } = useScheduledChangeRequestsWithVariant(
        projectId,
        featureId,
    );

    const filtered = changeRequests?.filter(
        (changeRequestIdentity) =>
            changeRequestIdentity.environment === environment,
    );

    if (filtered) {
        return filtered.map(
            (changeRequestIdentity) => changeRequestIdentity.id,
        );
    }

    return [];
};
