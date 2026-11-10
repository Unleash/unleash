import type { Tracking } from 'utils/trackingEvents';

export const archiveFlagTracking: Tracking = {
    event: 'flag-actions',
    type: 'archive-flag',
};

export const cloneFlagTracking: Tracking = {
    event: 'flag-actions',
    type: 'clone-flag',
};

export const copyFlagNameTracking: Tracking = {
    event: 'flag-actions',
    type: 'copy-flag-name',
};

export const toggleFlagStaleTracking: Tracking = {
    event: 'flag-actions',
    type: 'toggle-flag-stale',
};

export const deleteFlagTracking: Tracking = {
    event: 'flag-actions',
    type: 'delete-flag',
};

export const reviveFlagTracking: Tracking = {
    event: 'flag-actions',
    type: 'revive-flag',
};
