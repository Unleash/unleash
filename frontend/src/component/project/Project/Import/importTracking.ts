import type { Tracking } from 'utils/trackingEvents';

export const importFlagsTracking = {
    event: 'export-import',
    type: 'import-flags',
} satisfies Tracking;
