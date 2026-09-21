import type { Tracking } from 'utils/trackingEvents';

export const addReleasePlanTracking: Tracking = {
    event: 'release-management',
    type: 'add-release-plan',
};

export const confirmReplaceReleasePlanTracking: Tracking = {
    event: 'release-management',
    type: 'confirm-replace-release-plan',
};

export const createTemplateTracking: Tracking = {
    event: 'release-management',
    type: 'create-template',
};

export const createTemplateWithoutAccessTracking: Tracking = {
    event: 'release-management',
    type: 'create-template-without-access',
};
