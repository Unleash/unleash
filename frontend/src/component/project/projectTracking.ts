import type { Tracking } from 'utils/trackingEvents';

export const projectDeletedTracking: Tracking = {
    event: 'project-settings',
    type: 'project-deleted',
};
