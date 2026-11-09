import type { Tracking } from 'utils/trackingEvents';

export const deleteProjectTracking: Tracking = {
    event: 'project-settings',
    type: 'delete-project',
};

export const selectProjectTabTracking: Tracking = {
    event: 'project-navigation',
    type: 'select-tab',
};
