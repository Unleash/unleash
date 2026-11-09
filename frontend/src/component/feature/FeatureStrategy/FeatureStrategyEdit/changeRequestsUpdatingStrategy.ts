import type { ChangeRequestType } from 'component/changeRequest/changeRequest.types';

export const changeRequestsUpdatingStrategy = (
    changeRequests: ChangeRequestType[] | undefined,
    featureId: string,
    strategyId: string,
): ChangeRequestType[] =>
    changeRequests?.filter((changeRequest) =>
        changeRequest.features
            .find((feature) => feature.name === featureId)
            ?.changes.some(
                (change) =>
                    change.action === 'updateStrategy' &&
                    change.payload.id === strategyId,
            ),
    ) ?? [];
