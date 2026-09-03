import type { Tracking } from 'utils/trackingEvents';

export const importCompletedTracking = {
    event: 'export_import',
    type: 'import completed',
} satisfies Tracking;
