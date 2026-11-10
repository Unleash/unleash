import type { IProjectEnvironment } from 'interfaces/environments';
import type { Tracking } from 'utils/trackingEvents';

export const toggleEnvironmentVisibilityTracking: Tracking = {
    event: 'project-environments',
    type: 'toggle-environment-visibility',
};

export const environmentTrackingProps = (
    env: IProjectEnvironment,
    newState: 'visible' | 'hidden',
) => ({
    environmentType: env.type,
    newState,
});
