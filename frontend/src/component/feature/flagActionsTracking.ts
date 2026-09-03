import type { Tracking } from 'utils/trackingEvents';

export const flagArchivedTracking: Tracking = {
    event: 'flag-actions',
    type: 'archived',
};

export const flagClonedTracking: Tracking = {
    event: 'flag-actions',
    type: 'cloned',
};

export const flagNameCopiedTracking: Tracking = {
    event: 'flag-actions',
    type: 'name-copied',
};

export const flagStaleToggledTracking: Tracking = {
    event: 'flag-actions',
    type: 'stale-toggled',
};

export const flagDeletedTracking: Tracking = {
    event: 'flag-actions',
    type: 'deleted',
};

export const flagRevivedTracking: Tracking = {
    event: 'flag-actions',
    type: 'revived',
};
