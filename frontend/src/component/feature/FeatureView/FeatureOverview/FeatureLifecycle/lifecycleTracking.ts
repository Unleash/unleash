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
    name: string;
    openedFrom: LifecycleOpenedFrom;
    status: LifecycleCompletedStatus;
    variantOptionsCount: number;
}): Tracking => ({
    event: 'feature-lifecycle',
    type: 'complete-flag',
    props,
});

export const uncompleteFlagTracking = (props: {
    name: string;
    status?: 'kept' | 'discarded';
}): Tracking => ({
    event: 'feature-lifecycle',
    type: 'uncomplete-flag',
    props,
});

export const snoozeReminderTracking = (props: { name: string }): Tracking => ({
    event: 'feature-lifecycle',
    type: 'snooze-reminder',
    props,
});
