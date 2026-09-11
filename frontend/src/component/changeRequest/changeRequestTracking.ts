import type {
    ChangeRequestTrackedState,
    ChangeRequestTransitionState,
    ChangeRequestType,
} from 'component/changeRequest/changeRequest.types';
import type { Tracking } from 'utils/trackingEvents';

const transitionType: Record<ChangeRequestTransitionState, string> = {
    Approved: 'approved',
    Applied: 'applied',
    Scheduled: 'scheduled',
    Cancelled: 'cancelled',
    'In review': 'in-review',
    Rejected: 'rejected',
};

export const trackedState = (
    changeRequest: ChangeRequestType,
): ChangeRequestTrackedState =>
    changeRequest.state === 'Scheduled'
        ? `${changeRequest.state} ${changeRequest.schedule.status}`
        : changeRequest.state;

export const changeRequestTransitionTracking = (
    state: ChangeRequestTransitionState,
    previousState: ChangeRequestTrackedState | undefined,
): Tracking => ({
    event: 'change_request',
    type: transitionType[state],
    props: { previousState },
});

export const changeAddedTracking: Tracking = {
    event: 'change_request',
    type: 'change-added',
};

export const changeEditedTracking = (change: { action: string }): Tracking => ({
    event: 'change_request',
    type: 'change-edited',
    props: { changeType: change.action },
});

export const changeDiscardedTracking: Tracking = {
    event: 'change_request',
    type: 'change-discarded',
};

export const draftDiscardedTracking: Tracking = {
    event: 'change_request',
    type: 'draft-discarded',
};

export const commentAddedTracking: Tracking = {
    event: 'change_request',
    type: 'comment-added',
};

export const titleUpdatedTracking: Tracking = {
    event: 'change_request',
    type: 'title-updated',
};

export const approversUpdatedTracking: Tracking = {
    event: 'change_request',
    type: 'approvers-updated',
};

export const changeRequestTabSwitchedTracking: Tracking = {
    event: 'change_request',
    type: 'tab-switched',
};

export const changeRequestListFilteredTracking: Tracking = {
    event: 'change_request',
    type: 'list-filtered',
};

export const changeRequestToggledTracking = ({
    newState,
    environmentType,
}: {
    newState: 'enabled' | 'disabled';
    environmentType: string;
}): Tracking => ({
    event: 'change_request',
    type: 'change-request-toggled',
    props: {
        newState,
        environmentType,
    },
});

export const requiredApprovalsChangedTracking: Tracking = {
    event: 'change_request',
    type: 'required-approvals-changed',
};
