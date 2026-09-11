import type { Tracking } from 'utils/trackingEvents';

// The dialog only writes to local state, so `submitted` is the last row of this journey:
// the templates are persisted when the surrounding settings form is saved.
export const linkTemplateAddedTracking: Tracking = {
    event: 'feature-links',
    type: 'template-added',
};

export const linkTemplateEditedTracking: Tracking = {
    event: 'feature-links',
    type: 'template-edited',
};
