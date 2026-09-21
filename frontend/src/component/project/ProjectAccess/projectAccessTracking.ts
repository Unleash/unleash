import type { Tracking } from 'utils/trackingEvents';

type ProjectAccessType =
    | 'remove-access'
    | 'assign-access'
    | 'change-role'
    | 'view-group-details';

export const projectAccessTracking = (type: ProjectAccessType): Tracking => ({
    event: 'project-access',
    type,
});
