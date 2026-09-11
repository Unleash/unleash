import type { Tracking } from 'utils/trackingEvents';

export const projectDeletedTracking: Tracking = {
    event: 'project-settings',
    type: 'project-deleted',
};

export const projectTabNavigatedTracking: Tracking = {
    event: 'project-navigation',
    type: 'tab-navigated',
};
