import type { Tracking } from 'utils/trackingEvents';

// The dialog only writes to local state, so `submitted` is the last row of this journey:
// the templates are persisted when the surrounding settings form is saved.
export const addLinkTemplateTracking: Tracking = {
    event: 'feature-links',
    type: 'add-link-template',
};

export const editLinkTemplateTracking: Tracking = {
    event: 'feature-links',
    type: 'edit-link-template',
};
