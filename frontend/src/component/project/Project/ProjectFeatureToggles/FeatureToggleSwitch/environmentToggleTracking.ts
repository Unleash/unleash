import type { Tracking } from 'utils/trackingEvents';

export const environmentToggleTracking: Tracking = {
    event: 'flag-environment-toggled',
    type: 'environment-toggled',
};

export const prodGuardDialogTracking: Tracking = {
    event: 'flag-environment-toggled',
    type: 'prod-guard-confirm',
};

export const enableStrategiesDialogTracking: Tracking = {
    event: 'flag-environment-toggled',
    type: 'enable-strategies',
};
