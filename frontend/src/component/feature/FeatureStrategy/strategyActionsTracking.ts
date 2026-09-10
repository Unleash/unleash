import type { Tracking } from 'utils/trackingEvents';

export const strategyDeletedTracking: Tracking = {
    event: 'flag-strategy',
    type: 'strategy-deleted',
};

export const strategyToggledTracking: Tracking = {
    event: 'flag-strategy',
    type: 'strategy-toggled',
};

export const strategyCopiedTracking: Tracking = {
    event: 'flag-strategy',
    type: 'strategy-copied',
};
