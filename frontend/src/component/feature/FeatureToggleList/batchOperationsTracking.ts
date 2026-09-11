import type { Tracking } from 'utils/trackingEvents';

export const flagsToggledTracking: Tracking = {
    event: 'batch_operations',
    type: 'flags-toggled',
};
