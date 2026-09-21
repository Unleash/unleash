import type { Tracking } from 'utils/trackingEvents';

export const toggleEnvironmentTracking: Tracking = {
    event: 'flag-actions',
    type: 'toggle-environment',
};

export const confirmProdGuardTracking: Tracking = {
    event: 'flag-actions',
    type: 'confirm-prod-guard',
};

export const enableStrategiesDialogTracking: Tracking = {
    event: 'flag-actions',
    type: 'enable-strategies',
};
