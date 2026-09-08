import type { Tracking } from 'utils/trackingEvents';

export const importCompletedTracking = {
    event: 'export-import',
    type: 'import-completed',
} satisfies Tracking;
