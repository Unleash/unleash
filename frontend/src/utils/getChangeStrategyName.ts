import type {
    IChangeRequestAddStrategy,
    IChangeRequestUpdateMilestoneStrategy,
    IChangeRequestUpdateStrategy,
} from 'component/changeRequest/changeRequest.types';

export const getChangeStrategyName = (
    change:
        | IChangeRequestAddStrategy
        | IChangeRequestUpdateStrategy
        | IChangeRequestUpdateMilestoneStrategy,
): string => {
    if ('name' in change.payload) {
        return change.payload.name;
    }
    if (
        change.payload.snapshot &&
        (change.action === 'updateMilestoneStrategy' ||
            change.action === 'updateStrategy') &&
        'snapshot' in change.payload
    ) {
        return change.payload.snapshot.name;
    }
    return '';
};
