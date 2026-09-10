import type { Tracking } from 'utils/trackingEvents';

// This checkbox also shows up when saving a strategy, not only when toggling an
// environment, so it gets its own event.
export const prodGuardHiddenTracking: Tracking = {
    event: 'prod-guard',
    type: 'hide-setting-changed',
};
