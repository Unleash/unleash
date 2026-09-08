import type { IProjectEnvironment } from 'interfaces/environments';
import type { Tracking } from 'utils/trackingEvents';

export const environmentMadeVisibleTracking: Tracking = {
    event: 'project-environments',
    type: 'made-visible',
};

export const environmentHiddenTracking: Tracking = {
    event: 'project-environments',
    type: 'hidden',
};

export const environmentTrackingProps = (env: IProjectEnvironment) => ({
    environmentType: env.type,
});
