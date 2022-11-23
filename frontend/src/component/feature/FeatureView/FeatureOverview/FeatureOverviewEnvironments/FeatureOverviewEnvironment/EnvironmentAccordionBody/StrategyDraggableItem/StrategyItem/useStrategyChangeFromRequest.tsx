import { useChangeRequestOpen } from 'hooks/api/getters/useChangeRequestOpen/useChangeRequestOpen';

export const useStrategyChangeFromRequest = (
    projectId: string,
    featureId: string,
    environment: string,
    strategyId: string
) => {
    const { draft } = useChangeRequestOpen(projectId);

    const environmentDraft = draft?.find(
        draft => draft.environment === environment
    );
    const feature = environmentDraft?.features.find(
        feature => feature.name === featureId
    );
    const change = feature?.changes.find(change => {
        if (
            change.action === 'updateStrategy' ||
            change.action === 'deleteStrategy'
        ) {
            return change.payload.id === strategyId;
        }
    });

    return change;
};
