import type { Tracking } from 'utils/trackingEvents';

export const addAccessTracking: Tracking = {
    event: 'project-access',
    type: 'add-access',
};

export const editRoleTracking: Tracking = {
    event: 'project-access',
    type: 'edit-role',
};

export const removeAccessTracking: Tracking = {
    event: 'project-access',
    type: 'remove-access',
};

export const viewGroupDetailsTracking: Tracking = {
    event: 'project-access',
    type: 'view-group-details',
};
