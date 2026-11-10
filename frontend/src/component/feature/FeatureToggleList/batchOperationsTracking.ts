import type { Tracking } from 'utils/trackingEvents';

export const toggleFlagsTracking: Tracking = {
    event: 'batch-operations',
    type: 'toggle-flags',
};
