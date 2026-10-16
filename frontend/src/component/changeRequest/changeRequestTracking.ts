import type {
    ChangeRequestTrackedState,
    ChangeRequestTransitionState,
    ChangeRequestType,
} from 'component/changeRequest/changeRequest.types';
import type { Tracking, TrackingType } from 'utils/trackingEvents';

const transitionType: Record<ChangeRequestTransitionState, TrackingType> = {
    Approved: 'approve-change-request',
    Applied: 'apply-change-request',
    Scheduled: 'schedule-change-request',
    Cancelled: 'cancel-change-request',
    'In review': 'send-change-request-to-review',
    Rejected: 'reject-change-request',
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
    event: 'change-request',
    type: transitionType[state],
    props: { previousState },
});

export const addChangeTracking: Tracking = {
    event: 'change-request',
    type: 'add-change',
};

export const editChangeTracking = (change: { action: string }): Tracking => ({
    event: 'change-request',
    type: 'edit-change',
    props: { changeType: change.action },
});

export const deleteChangeTracking: Tracking = {
    event: 'change-request',
    type: 'delete-change',
};

export const deleteDraftTracking: Tracking = {
    event: 'change-request',
    type: 'delete-draft',
};

export const addCommentTracking: Tracking = {
    event: 'change-request',
    type: 'add-comment',
};

export const editTitleTracking: Tracking = {
    event: 'change-request',
    type: 'edit-title',
};

export const editApproversTracking: Tracking = {
    event: 'change-request',
    type: 'edit-approvers',
};

export const selectChangeRequestTabTracking: Tracking = {
    event: 'change-request',
    type: 'select-tab',
};

export const filterChangeRequestListTracking: Tracking = {
    event: 'change-request',
    type: 'filter-list',
};

export const toggleChangeRequestsTracking = ({
    newState,
    environmentType,
}: {
    newState: 'enabled' | 'disabled';
    environmentType: string;
}): Tracking => ({
    event: 'change-request',
    type: 'toggle-change-requests',
    props: {
        newState,
        environmentType,
    },
});

export const selectRequiredApprovalsTracking: Tracking = {
    event: 'change-request',
    type: 'select-required-approvals',
};
