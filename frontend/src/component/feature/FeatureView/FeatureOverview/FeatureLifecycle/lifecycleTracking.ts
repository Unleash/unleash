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

export const flagCompletedTracking = (props: {
    name: string;
    openedFrom: LifecycleOpenedFrom;
    status: LifecycleCompletedStatus;
    variantOptionsCount: number;
}): Tracking => ({
    event: 'feature-lifecycle',
    type: 'completed',
    props,
});

export const flagUncompletedTracking = (props: {
    name: string;
    status?: 'kept' | 'discarded';
}): Tracking => ({
    event: 'feature-lifecycle',
    type: 'uncompleted',
    props,
});

export const reminderSnoozedTracking = (props: { name: string }): Tracking => ({
    event: 'feature-lifecycle',
    type: 'reminder-snoozed',
    props,
});
