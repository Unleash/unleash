import type { Tracking } from 'utils/trackingEvents';

type ProjectAccessType =
    | 'removed'
    | 'assigned'
    | 'role-changed'
    | 'group-details';

export const projectAccessTracking = (type: ProjectAccessType): Tracking => ({
    event: 'project-access',
    type,
});
