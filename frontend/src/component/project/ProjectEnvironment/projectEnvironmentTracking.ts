import type { IProjectEnvironment } from 'interfaces/environments';
import type { Tracking } from 'utils/trackingEvents';

export const showEnvironmentTracking: Tracking = {
    event: 'project-environments',
    type: 'show-environment',
};

export const hideEnvironmentTracking: Tracking = {
    event: 'project-environments',
    type: 'hide-environment',
};

export const environmentTrackingProps = (env: IProjectEnvironment) => ({
    environmentType: env.type,
});
