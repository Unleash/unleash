import type { Tracking } from 'utils/trackingEvents';

export const releasePlanAddedTracking: Tracking = {
    event: 'release-management',
    type: 'release-plan-added',
};

export const releasePlanReplaceConfirmTracking: Tracking = {
    event: 'release-management',
    type: 'release-plan-replace-confirm',
};

export const releaseTemplateCreatedTracking: Tracking = {
    event: 'release-management',
    type: 'template-created',
};

export const releaseTemplateNoAccessTracking: Tracking = {
    event: 'release-management',
    type: 'template-create-no-access',
};
