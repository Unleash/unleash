import type { Tracking } from 'utils/trackingEvents';

export type LifecycleOpenedFrom =
    | 'reminder-banner'
    | 'flag-metadata'
    | 'project-list'
    | 'personal-dashboard';

export type LifecycleCompletedStatus =
    | 'kept'
    | 'kept-with-variant'
    | 'discarded';

export const completeFlagTracking = (props: {
    openedFrom: LifecycleOpenedFrom;
    status: LifecycleCompletedStatus;
    variantOptionsCount: number;
}): Tracking => ({
    event: 'feature-lifecycle',
    type: 'complete-flag',
    props,
});

export const uncompleteFlagTracking = (props: {
    status?: 'kept' | 'discarded';
}): Tracking => ({
    event: 'feature-lifecycle',
    type: 'uncomplete-flag',
    props,
});

export const snoozeReminderTracking: Tracking = {
    event: 'feature-lifecycle',
    type: 'snooze-reminder',
};
